using UnityEngine;
using System;
using System.Collections;

namespace GATU
{
	public class GATUAntenna: PartModule
	{
		[KSPField]
		public string posthost = "127.0.0.1";
		[KSPField]
		public string postport = "8080";
		[KSPField]
		public string posturi = "setapi";
		[KSPField]
		public string cameraposturi = "setimage";

		[KSPField]
		public float high_freq = 0.1f;
		[KSPField]
		public float med_freq = 0.25f;
		[KSPField]
		public float low_freq = 1.0f;

		private	string postlocation = "";

		private double next_high_poll_time = -1;
		private double next_med_poll_time  = -1;
		private double next_low_poll_time  = -1;


		private IEnumerator GetAndSendHighPollData()
		{
			System.Collections.Generic.Dictionary<string, double> DoubleValues = new System.Collections.Generic.Dictionary<string, double>();
			System.Collections.Generic.Dictionary<string, string> StringValues = new System.Collections.Generic.Dictionary<string, string>();
			System.Collections.Generic.Dictionary<string, int> IntValues = new System.Collections.Generic.Dictionary<string, int>();

			DoubleValues["t.universalTime"] = Planetarium.GetUniversalTime ();
			DoubleValues["v.missionTime"] = this.vessel.missionTime;
			DoubleValues ["f.throttle"] = this.vessel.ctrlState.mainThrottle;

			IntValues["v.rcsValue"] = this.vessel.ActionGroups[KSPActionGroup.RCS] ? 1 : 0;
			IntValues["v.sasValue"] = this.vessel.ActionGroups[KSPActionGroup.SAS] ? 1 : 0;
			IntValues["v.lightValue"] = this.vessel.ActionGroups[KSPActionGroup.Light] ? 1 : 0;
			IntValues["v.brakeValue"] = this.vessel.ActionGroups[KSPActionGroup.Brakes] ? 1 : 0;
			IntValues["v.gearValue"] = this.vessel.ActionGroups[KSPActionGroup.Gear] ? 1 : 0;

			//Target Data
			StringValues["tar.name"] = "No Target";
			DoubleValues["tar.distance"] = double.NaN;
			DoubleValues["tar.inclination"] = double.NaN;
			DoubleValues["tar.eccentricity"] = double.NaN;
			DoubleValues ["tar.trueAnomaly"] = double.NaN;
			DoubleValues ["tar.phaseAngle"] = double.NaN;
			DoubleValues ["tar.SOI"] = double.NaN;


			if (FlightGlobals.fetch.VesselTarget != null) {
				StringValues["tar.name"]         = FlightGlobals.fetch.VesselTarget.GetName ();
				DoubleValues["tar.distance"]     = Vector3.Distance (FlightGlobals.fetch.VesselTarget.GetTransform ().position, this.vessel.GetTransform ().position);
				DoubleValues["tar.inclination"]  = FlightGlobals.fetch.VesselTarget.GetOrbit ().inclination;
				DoubleValues["tar.eccentricity"] = FlightGlobals.fetch.VesselTarget.GetOrbit ().eccentricity;
				DoubleValues["tar.trueAnomaly"]  = FlightGlobals.fetch.VesselTarget.GetOrbit ().TrueAnomalyAtUT (Planetarium.GetUniversalTime ()) * (180.0 / Math.PI);
				DoubleValues["tar.phaseAngle"]   = helpers.FindPhaseAngleOfTarget (this.vessel,FlightGlobals.fetch.VesselTarget.GetName ());
			}

			//Vessel Data
			DoubleValues["v.orbitalVelocity"] = this.vessel.obt_velocity.magnitude;;
			DoubleValues["v.altitude"]  = this.vessel.altitude;
			DoubleValues["v.heightFromTerrain"] = this.vessel.heightFromTerrain;
			DoubleValues["v.surfaceSpeed"] = this.vessel.horizontalSrfSpeed;
			DoubleValues["v.verticalSpeed"] = this.vessel.verticalSpeed;
			DoubleValues["v.geeForce"] = this.vessel.geeForce;
			DoubleValues["v.atmosphericDensity"] = this.vessel.atmDensity;
			DoubleValues["v.dynamicPressure"] = (this.vessel.atmDensity * 0.5) * Math.Pow(this.vessel.srf_velocity.magnitude, 2);

			DoubleValues["v.long"] = this.vessel.longitude;
			if (DoubleValues["v.long"] > 180) { DoubleValues["v.long"] -= 360; }
			if (DoubleValues["v.long"] < -180) { DoubleValues["v.long"] += 360; }

			DoubleValues["v.lat"] = this.vessel.latitude;
			StringValues["v.body"] = this.vessel.orbit.referenceBody.name;

			DoubleValues["v.angleToPrograde"] = double.NaN;
			if (this.vessel.mainBody != Planetarium.fetch.Sun)
			{
				double ut = Planetarium.GetUniversalTime();
				CelestialBody body = this.vessel.mainBody;
				Vector3d bodyPrograde = body.orbit.getOrbitalVelocityAtUT(ut);
				Vector3d bodyNormal = body.orbit.GetOrbitNormal();
				Vector3d vesselPos = this.vessel.orbit.getRelativePositionAtUT(ut);
				Vector3d vesselPosInPlane = Vector3d.Exclude(bodyNormal, vesselPos); 
				double angle = Vector3d.Angle(vesselPosInPlane, bodyPrograde);
				if (Vector3d.Dot(Vector3d.Cross(vesselPosInPlane, bodyPrograde), bodyNormal) < 0)
				{ // Correct for angles > 180 degrees
					angle = 360 - angle;
				}
				if (this.vessel.orbit.GetOrbitNormal().z < 0)
				{ // Check for retrograde orbit
					angle = 360 - angle;
				}
				DoubleValues["v.angleToPrograde"] = angle;
			}

			//POST DATA
			var form = new WWWForm();
			form.AddField("type", "high");

			form.AddField("time", helpers.UnixTimeAsString());
			foreach (System.Collections.Generic.KeyValuePair<string, double> entry in DoubleValues)
			{
				form.AddField(entry.Key, entry.Value.ToString());
			}
			foreach (System.Collections.Generic.KeyValuePair<string, string> entry in StringValues)
			{
				form.AddField(entry.Key, entry.Value);
			}
			foreach (System.Collections.Generic.KeyValuePair<string, int> entry in IntValues)
			{
				form.AddField(entry.Key, entry.Value.ToString());
			}

			var post = new WWW(postlocation,form);
			yield return post;
			if (!string.IsNullOrEmpty(post.error))
				print("GetAndSendHighPollData: WWWFORM ERROR:" + post.error);
			next_high_poll_time = Time.time + high_freq;

		}
		private IEnumerator GetAndSendMedPollData()
		{
			//Orbit data
			System.Collections.Generic.Dictionary<string, double> DoubleValues = new System.Collections.Generic.Dictionary<string, double>();
			DoubleValues["o.ApA"] = this.vessel.orbit.ApA;
			DoubleValues["o.PeA"] = this.vessel.orbit.PeA;
			DoubleValues["o.timeToAp"] = this.vessel.orbit.timeToAp;
			DoubleValues["o.timeToPe"] = this.vessel.orbit.timeToPe;
			DoubleValues["o.inclination"] = this.vessel.orbit.inclination;
			DoubleValues["o.eccentricity"] = this.vessel.orbit.eccentricity;
			//Resource data
			System.Collections.Generic.Dictionary<string, double> ResourceCurrent = new System.Collections.Generic.Dictionary<string, double>();
			System.Collections.Generic.Dictionary<string, double> ResourceMax = new System.Collections.Generic.Dictionary<string, double>();

			DoubleValues ["v.overheatRatio"] = 0.0d;

			foreach (Part part in this.vessel.parts) {
				//resources
				if (part.Resources.Count > 0) {
					foreach (PartResource partResource in part.Resources) {
						if (!ResourceCurrent.ContainsKey(partResource.resourceName)) { ResourceCurrent [partResource.resourceName] = 0; }
						if (!ResourceMax.ContainsKey(partResource.resourceName))     { ResourceMax     [partResource.resourceName] = 0; }
						ResourceCurrent [partResource.resourceName] += partResource.amount;
						ResourceMax     [partResource.resourceName] += partResource.maxAmount;
					}
				}
				//overheat
				foreach (PartModule pm in part.Modules) {
					if (!pm.isEnabled) { continue; }
					var thatEngineModule = pm as ModuleEngines;
					var thatEngineModuleFX = pm as ModuleEnginesFX;
					if (thatEngineModule != null || thatEngineModuleFX != null) {
						double thistempratio = part.temperature / part.maxTemp;
						DoubleValues ["v.overheatRatio"] = (thistempratio > DoubleValues ["v.overheatRatio"]) ? thistempratio : DoubleValues ["v.overheatRatio"];
					}
				}
			}
			DoubleValues ["v.overheat"] = 0.0;
			foreach (Part thatPart in this.vessel.parts) {

			}
			//POST DATA
			var form = new WWWForm();
			form.AddField("type", "med");
			form.AddField("time", helpers.UnixTimeAsString());
			foreach (System.Collections.Generic.KeyValuePair<string, double> entry in DoubleValues)
			{
				form.AddField(entry.Key,entry.Value.ToString());
			}
			foreach (System.Collections.Generic.KeyValuePair<string, double> entry in ResourceCurrent)
			{
				form.AddField("r.resource["+entry.Key+"]", ResourceCurrent[entry.Key].ToString());
			}
			foreach (System.Collections.Generic.KeyValuePair<string, double> entry in ResourceMax)
			{
				form.AddField("r.resourceMax["+entry.Key+"]", ResourceMax[entry.Key].ToString());
			}
			var post = new WWW(postlocation,form);
			yield return post;
			if (!string.IsNullOrEmpty(post.error))
				print("GetAndSendMedPollData: WWWFORM ERROR:" + post.error);
			next_med_poll_time = Time.time + med_freq;

		}
		private IEnumerator GetAndSendLowPollData()
		{
			//Vessel Data
			print ("GetAndSendLowPollData:" + postlocation);
			System.Collections.Generic.Dictionary<string, double> DoubleValues = new System.Collections.Generic.Dictionary<string, double>();
			System.Collections.Generic.Dictionary<string, string> StringValues = new System.Collections.Generic.Dictionary<string, string>();

			Quaternion result = helpers.updateHeadingPitchRollField(this.vessel);
			DoubleValues["v.heading"] = result.eulerAngles.y;
			DoubleValues["v.pitch"] = (result.eulerAngles.x > 180) ? (360.0 - result.eulerAngles.x) : -result.eulerAngles.x;
			DoubleValues["v.roll"] = (result.eulerAngles.z > 180)  ? (result.eulerAngles.z - 360.0) : result.eulerAngles.z;
			DoubleValues ["v.encounter"] = (this.vessel.orbit.patchEndTransition == Orbit.PatchTransitionType.ENCOUNTER) ? 1d : 0d;
			DoubleValues ["v.escape"] = (this.vessel.orbit.patchEndTransition == Orbit.PatchTransitionType.ESCAPE) ? 1d : 0d;
			StringValues ["v.encounter.body"] = (this.vessel.orbit.patchEndTransition == Orbit.PatchTransitionType.ENCOUNTER) ? vessel.orbit.nextPatch.referenceBody.bodyName : "None";

			//POST DATA
			var form = new WWWForm();
			form.AddField("type", "low");
			form.AddField("time", helpers.UnixTimeAsString());
			foreach (System.Collections.Generic.KeyValuePair<string, double> entry in DoubleValues)
			{
				form.AddField(entry.Key,entry.Value.ToString());
			}
			foreach (System.Collections.Generic.KeyValuePair<string, string> entry in StringValues)
			{
				form.AddField(entry.Key, entry.Value);
			}

			var post = new WWW(postlocation,form);
			yield return post;
			if (!string.IsNullOrEmpty(post.error))
				print("GetAndSendLowPollData: WWWFORM ERROR:" + post.error);
			next_low_poll_time = Time.time + low_freq;
		}

		public override void OnUpdate()
		{
			if (this.part == null || this.part.vessel != FlightGlobals.ActiveVessel) {
				return;
			}
			if (Time.time > next_high_poll_time && next_high_poll_time > 0) {
				next_high_poll_time = -1;
				StartCoroutine(GetAndSendHighPollData ());
			}
			if (Time.time > next_med_poll_time && next_med_poll_time > 0) {
				next_med_poll_time = -1;
				StartCoroutine(GetAndSendMedPollData ());
			}
			if (Time.time > next_low_poll_time && next_low_poll_time > 0) {
				next_low_poll_time = -1;
				StartCoroutine(GetAndSendLowPollData ());
			}
		}

		public override void OnStart(StartState state)
		{
			if (state != StartState.Editor) 
			{
				postlocation = "http://" + posthost + ":" + postport + "/" + posturi;
				next_high_poll_time = Time.time + high_freq;
				next_med_poll_time = Time.time + med_freq;
				next_low_poll_time = Time.time + low_freq;
				return;
			}
		}



	}
}

