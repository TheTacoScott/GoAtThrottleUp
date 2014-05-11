using UnityEngine;
using System;
using System.Collections;

public class GoAtThrottleUpAntenna: PartModule
{
	[KSPField]
	public string posthost = "127.0.0.1";
	[KSPField]
	public string postport = "8080";
	[KSPField]
	public string posturi = "post.data";

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

	private string UnixTimeAsString()
	{
		var epochStart = new System.DateTime(1970, 1, 1, 8, 0, 0, System.DateTimeKind.Utc);
		var timestamp = (System.DateTime.UtcNow - epochStart).TotalSeconds;
		return timestamp.ToString();
	}
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

		if (FlightGlobals.fetch.VesselTarget != null) {
			StringValues["tar.name"]         = FlightGlobals.fetch.VesselTarget.GetName ();
			DoubleValues["tar.distance"]     = Vector3.Distance (FlightGlobals.fetch.VesselTarget.GetTransform ().position, this.vessel.GetTransform ().position);
			DoubleValues["tar.inclination"]  = FlightGlobals.fetch.VesselTarget.GetOrbit ().inclination;
			DoubleValues["tar.eccentricity"] = FlightGlobals.fetch.VesselTarget.GetOrbit ().eccentricity;
			DoubleValues["tar.trueAnomaly"]  = FlightGlobals.fetch.VesselTarget.GetOrbit ().TrueAnomalyAtUT (Planetarium.GetUniversalTime ()) * (180.0 / Math.PI);
			DoubleValues["tar.phaseAngle"]   = FindPhaseAngleOfTarget ();
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
		form.AddField("time", UnixTimeAsString());
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
		else
			print("GetAndSendHighPollData: WWWFORM: Finished Uploading Data");
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

		foreach (Part part in this.vessel.parts) {
			if (part.Resources.Count > 0) {
				foreach (PartResource partResource in part.Resources) {
					if (!ResourceCurrent.ContainsKey(partResource.resourceName)) { ResourceCurrent [partResource.resourceName] = 0; }
					if (!ResourceMax.ContainsKey(partResource.resourceName))     { ResourceMax     [partResource.resourceName] = 0; }
					ResourceCurrent [partResource.resourceName] += partResource.amount;
					ResourceMax     [partResource.resourceName] += partResource.maxAmount;
				}
			}
		}

		//POST DATA
		var form = new WWWForm();
		form.AddField("type", "med");
		form.AddField("time", UnixTimeAsString());
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
		else
			print("GetAndSendMedPollData: WWWFORM: Finished Uploading Data");
		next_med_poll_time = Time.time + med_freq;

	}
	private IEnumerator GetAndSendLowPollData()
	{
		//Vessel Data
		print ("GetAndSendLowPollData:" + postlocation);
		System.Collections.Generic.Dictionary<string, double> DoubleValues = new System.Collections.Generic.Dictionary<string, double>();
		Quaternion result = updateHeadingPitchRollField(this.vessel);
		DoubleValues["v.heading"] = result.eulerAngles.y;
		DoubleValues["v.pitch"] = (result.eulerAngles.x > 180) ? (360.0 - result.eulerAngles.x) : -result.eulerAngles.x;
		DoubleValues["v.roll"] = (result.eulerAngles.z > 180)  ? (result.eulerAngles.z - 360.0) : result.eulerAngles.z;


		//POST DATA
		var form = new WWWForm();
		form.AddField("type", "low");
		form.AddField("time", UnixTimeAsString());
		foreach (System.Collections.Generic.KeyValuePair<string, double> entry in DoubleValues)
		{
			form.AddField(entry.Key,entry.Value.ToString());
		}

		var post = new WWW(postlocation,form);
		yield return post;
		if (!string.IsNullOrEmpty(post.error))
			print("GetAndSendLowPollData: WWWFORM ERROR:" + post.error);
		else
			print("GetAndSendLowPollData: WWWFORM: Finished Uploading Data");
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

	//Borrowed from MechJeb2 & Telemachus
	private Quaternion updateHeadingPitchRollField(Vessel v)
	{
		Vector3d CoM, north, up;
		Quaternion rotationSurface;

		CoM = v.findWorldCenterOfMass();
		up = (CoM - v.mainBody.position).normalized;

		north = Vector3d.Exclude(up, (v.mainBody.position + v.mainBody.transform.up * (float)v.mainBody.Radius) - CoM).normalized;

		rotationSurface = Quaternion.LookRotation(north, up);
		return Quaternion.Inverse(Quaternion.Euler(90, 0, 0) * Quaternion.Inverse(v.GetTransform().rotation) * rotationSurface);
	}
	private double FindPhaseAngleOfTarget()
	{
		                  //0       1       2        3       4       5      6       7      8        9        10     11      12       13     14      15      16
		string[] BODIES = {"Sun","Kerbin", "Mun", "Minmus", "Moho", "Eve", "Duna", "Ike", "Jool", "Laythe", "Vall", "Bop", "Tylo", "Gilly", "Pol", "Dres", "Eeloo"};
		CelestialBody body = FlightGlobals.Bodies[0];
		for (int i=0;i<BODIES.Length;i++)
		{
			if (FlightGlobals.Bodies[i].GetName() == FlightGlobals.fetch.VesselTarget.GetName ())
			{
				body = FlightGlobals.Bodies[i];
				break;
			}
		}


		System.Collections.Generic.List<CelestialBody> parentBodies = new System.Collections.Generic.List<CelestialBody>();
		CelestialBody parentBody = this.vessel.mainBody;
		while (true)
		{
			if (parentBody == body)
			{
				return double.NaN;
			}
			parentBodies.Add(parentBody);
			if (parentBody == Planetarium.fetch.Sun)
			{
				break;
			}
			else
			{
				parentBody = parentBody.referenceBody;
			}
		}

		while (!parentBodies.Contains(body.referenceBody))
		{
			body = body.referenceBody;
		}

		Orbit orbit = this.vessel.orbit;
		while (orbit.referenceBody != body.referenceBody)
		{
			orbit = orbit.referenceBody.orbit;
		}

		// Calculate the phase angle
		double ut = Planetarium.GetUniversalTime();
		Vector3d vesselPos = orbit.getRelativePositionAtUT(ut);
		Vector3d bodyPos = body.orbit.getRelativePositionAtUT(ut);
		double phaseAngle = (Math.Atan2(bodyPos.y, bodyPos.x) - Math.Atan2(vesselPos.y, vesselPos.x)) * (180.0 / Math.PI);
		return (phaseAngle < 0) ? phaseAngle + 360 : phaseAngle;
	}

}


