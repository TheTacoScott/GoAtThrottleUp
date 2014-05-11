using UnityEngine;
using System.Collections;

public class GoAtThrottleUpCamera: PartModule
{
	[KSPField]
	public string posthost = "127.0.0.1";
	[KSPField]
	public string postport = "8080";
	[KSPField]
	public string posturi = "post.image";


	private Camera NearCamera;
	private Camera FarCamera;
	private Camera SkyboxCamera;

	private const int maximum = 8;

	private const int maxres = 512;
	private const int minres = 64;

	private const float maxfreq = 2.5f;
	private const float minfreq = 0.5f;

	private const float fovAngle = 60f;
	private const float aspect = 1.0f;

	private double nextRenderTime = -1;
	
	private Vector3 rotateConstant = new Vector3 (-90, 0, 0);


	[KSPField(isPersistant = true,guiActive = true, guiActiveEditor = true, guiName = "ID")]
	public int current = 1;

	[KSPField(isPersistant = true,guiActive = true, guiActiveEditor = true, guiName = "Resolution")]
	public int camerares = 128;

	[KSPField(isPersistant = true,guiActive = true, guiActiveEditor = true, guiName = "Capture Frequency")]
	public float freq = 1.0f;

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
		freq += 0.5f;
		if (freq > maxfreq) {
			freq = minfreq;
		}
	}


	private IEnumerator PostScreenshot(byte[] bytes)
	{
		string postlocation = "http://" + posthost + ":" + postport + "/" + posturi;
		var epochStart = new System.DateTime(1970, 1, 1, 8, 0, 0, System.DateTimeKind.Utc);
		var timestamp = (System.DateTime.UtcNow - epochStart).TotalSeconds;
		string timestampasstring = timestamp.ToString();

		var form = new WWWForm();
		form.AddField("camid", current);
		form.AddField("camtime", timestampasstring);
		form.AddBinaryData("camimage", bytes);
		var post = new WWW(postlocation,form);

		yield return post;
		if (!string.IsNullOrEmpty(post.error))
			print("WWWFORM ERROR:" + post.error);
		else
			print("WWWFORM: Finished Uploading Screenshot");

		nextRenderTime = Time.time + freq;

	}

	public void RenderCamera()
	{
		if (this.vessel != FlightGlobals.ActiveVessel) { return;}

		if (this.part == null || this.part.vessel != FlightGlobals.ActiveVessel ) 
		{
			UnityEngine.Object.Destroy(NearCamera);
			UnityEngine.Object.Destroy(FarCamera);
			UnityEngine.Object.Destroy(SkyboxCamera);
			return;
		}

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
		StartCoroutine(PostScreenshot (bytes));

	}
	public override void OnUpdate()
	{

		if (nextRenderTime > 0 && Time.time >= nextRenderTime) {
			nextRenderTime = -1;
			RenderCamera ();
		}
		return;
	}
	public override void OnStart(StartState state)
	{
		if (state != StartState.Editor) 
		{
			nextRenderTime = Time.time + freq;
			Camera sourceNearCam = null;
			Camera sourceFarCam  = null;
			Camera sourceSkyCam  = null;

			foreach (Camera cam in Camera.allCameras) {	if (cam.name == "Camera 00") {sourceNearCam = cam;break;}}
			foreach (Camera cam in Camera.allCameras) {	if (cam.name == "Camera 01") {sourceFarCam = cam;break;}}
			foreach (Camera cam in Camera.allCameras) {	if (cam.name == "Camera ScaledSpace") {sourceSkyCam = cam;break;}}

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


