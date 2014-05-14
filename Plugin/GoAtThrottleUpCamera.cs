using UnityEngine;
using System.Collections;

namespace GATU
{
	public class ScreenShotAndTime
	{
		public ScreenShotAndTime(byte[] data, string thetime)
		{
			this.dataScreenShotData = data;
			this.dataTheTime = thetime;
		}
		public byte[] dataScreenShotData ;
		public string dataTheTime;
	}

	public class GATUCamera: PartModule
	{
		[KSPField]
		public string posthost = "127.0.0.1";
		[KSPField]
		public string postport = "8080";
		[KSPField]
		public string posturi = "data.post";
		[KSPField]
		public string cameraposturi = "image.post";

		private bool hasParentAntenna = false;

		private Camera NearCamera;
		private Camera FarCamera;
		private Camera SkyboxCamera;

		private const int qmax = 5;

		private const int maximum = 12;

		private const int maxres = 512;
		private const int minres = 32;

		private const float maxfreq = 2.0f;
		private const float minfreq = 0.0625f;

		private const float fovAngle = 60f;
		private const float aspect = 1.0f;

		private double nextRenderTime = -1;

		System.Collections.Generic.Queue<ScreenShotAndTime> screenshotq = new System.Collections.Generic.Queue<ScreenShotAndTime>();

		private Vector3 rotateConstant = new Vector3 (-90, 0, 0);


		[KSPField(isPersistant = true,guiActive = true, guiActiveEditor = true, guiName = "ID")]
		public int current = 1;

		[KSPField(isPersistant = true,guiActive = true, guiActiveEditor = true, guiName = "Resolution")]
		public int camerares = 128;

		[KSPField(isPersistant = true,guiActive = true, guiActiveEditor = true, guiName = "Capture Frequency")]
		public float freq = 0.5f;

		[KSPField(guiActive = true, guiActiveEditor = false, guiName = "Status")]
		public string status = "Nominal";

		[KSPEvent(guiActive = false, guiActiveEditor = false, guiName = "Reboot",externalToEVAOnly=true,unfocusedRange=3,guiActiveUnfocused=true,active=true)]
		public void RebootIt()
		{
			status = "Nominal";
		}

		[KSPEvent(guiActive = false, guiActiveEditor = false, guiName = "Break",externalToEVAOnly=true,unfocusedRange=3,guiActiveUnfocused=true,active=true)]
		public void BreakIt()
		{
			status = "Unresponsive";
		}

		[KSPEvent(guiActive = false, guiActiveEditor = true, guiName = "Change ID")]
		public void IdPlus()
		{
			current++;
			if (current > maximum) {
				current = 1;
			}
		}

		[KSPEvent(guiActive = false, guiActiveEditor = true, guiName = "Change Resolution")]
		public void ResPlus()
		{
			camerares = camerares * 2;
			if (camerares > maxres) {
				camerares = minres;
			}
		}
			
		[KSPEvent(guiActive = false, guiActiveEditor = true, guiName = "Change Frequency")]
		public void FreqPlus()
		{
			freq = freq * 2;
			if (freq > maxfreq) {
				freq = minfreq;
			}
		}


		private IEnumerator PostScreenshot(ScreenShotAndTime passedData)
		{
			string postlocation = "http://" + posthost + ":" + postport + "/" + cameraposturi;

			var form = new WWWForm();
			form.AddField("camid", current);
			form.AddField("camtime", passedData.dataTheTime);
			form.AddBinaryData("camimage", passedData.dataScreenShotData);
			var post = new WWW(postlocation,form);
			yield return post;
			if (!string.IsNullOrEmpty(post.error))
				print("WWWFORM ERROR:" + post.error);

			//nextRenderTime = Time.time + freq;

		}

		public void RenderCamera()
		{
			print ("RenderCamera() : " + Time.time);
			RenderTexture rt = new RenderTexture(camerares, camerares, 24);

			NearCamera.targetTexture = rt;
			NearCamera.transform.rotation = this.part.gameObject.transform.rotation;
			NearCamera.transform.Rotate(rotateConstant);
			NearCamera.transform.position = this.part.gameObject.transform.position;

			FarCamera.targetTexture = rt;
			FarCamera.transform.rotation = this.part.gameObject.transform.rotation;
			FarCamera.transform.Rotate(rotateConstant);
			FarCamera.transform.position = this.part.gameObject.transform.position;

			SkyboxCamera.targetTexture = rt;
			SkyboxCamera.transform.rotation = this.part.gameObject.transform.rotation;
			SkyboxCamera.transform.Rotate(rotateConstant);

			SkyboxCamera.Render ();
			FarCamera.Render ();
			NearCamera.Render(); 

			Texture2D screenShot = new Texture2D(camerares, camerares, TextureFormat.RGB24, false);
			RenderTexture backupRenderTexture = RenderTexture.active;
			RenderTexture.active = rt;
			screenShot.ReadPixels(new Rect(0, 0, camerares, camerares), 0, 0);

			NearCamera.targetTexture = null; 
			FarCamera.targetTexture = null; 
			SkyboxCamera.targetTexture = null;

			RenderTexture.active = backupRenderTexture;

			Destroy(rt);
			byte[] bytes = screenShot.EncodeToPNG();
			Destroy (screenShot);

			screenshotq.Enqueue (new ScreenShotAndTime (bytes, helpers.UnixTimeAsString ()));
			nextRenderTime = Time.time + freq + Random.Range(-0.05F, 0.05F);

		}
		public override void OnUpdate()
		{
			if (!hasParentAntenna) {
				return;
			}

			//if (this.vessel != FlightGlobals.ActiveVessel) { return;}

			if (this.part == null) 
			{
				UnityEngine.Object.Destroy(NearCamera);
				UnityEngine.Object.Destroy(FarCamera);
				UnityEngine.Object.Destroy(SkyboxCamera);
				return;
			}

			if (nextRenderTime > 0 && Time.time >= nextRenderTime && screenshotq.Count < qmax) 
			{
				nextRenderTime = -1;
				RenderCamera ();
			}
			if (screenshotq.Count > 0) {
				StartCoroutine(PostScreenshot (screenshotq.Dequeue()));
			}
			return;
		}
		public override void OnStart(StartState state)
		{
			if (state != StartState.Editor) 
			{
				hasParentAntenna = this.vessel.parts.FindAll (thepart => thepart.Modules.Contains ("GATUAntenna")).Count > 0;
				if (!hasParentAntenna) {
					return;
				}

				nextRenderTime = Time.time + freq;
				Camera sourceNearCam = null;
				Camera sourceFarCam = null;
				Camera sourceSkyCam = null;

				foreach (Camera cam in Camera.allCameras) {
					if (cam.name == "Camera 00") {
						sourceNearCam = cam;
						break;
					}
				}
				foreach (Camera cam in Camera.allCameras) {
					if (cam.name == "Camera 01") {
						sourceFarCam = cam;
						break;
					}
				}
				foreach (Camera cam in Camera.allCameras) {
					if (cam.name == "Camera ScaledSpace") {
						sourceSkyCam = cam;
						break;
					}
				}

				var NearCameraGameObject = new GameObject ("GoAtThrottleUp Cam Camera 00");
				NearCamera = NearCameraGameObject.AddComponent<Camera> ();
				NearCamera.CopyFrom (sourceNearCam);
				NearCamera.enabled = false;
				NearCamera.fieldOfView = fovAngle;
				NearCamera.aspect = aspect;

				var FarCameraGameObject = new GameObject ("GoAtThrottleUp Cam Camera 01");
				FarCamera = FarCameraGameObject.AddComponent<Camera> ();
				FarCamera.CopyFrom (sourceFarCam);
				FarCamera.enabled = false;
				FarCamera.fieldOfView = fovAngle;
				FarCamera.aspect = aspect;

				var SkyboxCameraGameObject = new GameObject ("GoAtThrottleUp Cam Camera ScaledSpace");
				SkyboxCamera = SkyboxCameraGameObject.AddComponent<Camera> ();
				SkyboxCamera.transform.position = sourceSkyCam.transform.position;
				SkyboxCamera.CopyFrom (sourceSkyCam);
				SkyboxCamera.enabled = false;
				SkyboxCamera.fieldOfView = fovAngle;
				SkyboxCamera.aspect = aspect;

			}
				
		}
	}
}

