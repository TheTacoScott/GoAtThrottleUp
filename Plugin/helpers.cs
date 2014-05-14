using System;
using UnityEngine;

namespace GATU
{
	public class helpers
	{
		static public string UnixTimeAsString ()
		{
			var epochStart = new System.DateTime (1970, 1, 1, 8, 0, 0, System.DateTimeKind.Utc);
			var timestamp = (System.DateTime.UtcNow - epochStart).TotalSeconds;
			return timestamp.ToString ();
		}

		//Borrowed from MechJeb2 & Telemachus
		static public Quaternion updateHeadingPitchRollField(Vessel v)
		{
			Vector3d CoM, north, up;
			Quaternion rotationSurface;

			CoM = v.findWorldCenterOfMass();
			up = (CoM - v.mainBody.position).normalized;

			north = Vector3d.Exclude(up, (v.mainBody.position + v.mainBody.transform.up * (float)v.mainBody.Radius) - CoM).normalized;

			rotationSurface = Quaternion.LookRotation(north, up);
			return Quaternion.Inverse(Quaternion.Euler(90, 0, 0) * Quaternion.Inverse(v.GetTransform().rotation) * rotationSurface);
		}

		static public double FindPhaseAngleOfTarget(Vessel thisVessel, string TargetName)
		{
			//0       1       2        3       4       5      6       7      8        9        10     11      12       13     14      15      16
			string[] BODIES = {"Sun","Kerbin", "Mun", "Minmus", "Moho", "Eve", "Duna", "Ike", "Jool", "Laythe", "Vall", "Bop", "Tylo", "Gilly", "Pol", "Dres", "Eeloo"};
			CelestialBody body = FlightGlobals.Bodies[0];
			for (int i=0;i<BODIES.Length;i++)
			{
				//if (FlightGlobals.Bodies[i].GetName() == FlightGlobals.fetch.VesselTarget.GetName ())
				if (FlightGlobals.Bodies[i].GetName() == TargetName)
				{
					body = FlightGlobals.Bodies[i];
					break;
				}
			}


			System.Collections.Generic.List<CelestialBody> parentBodies = new System.Collections.Generic.List<CelestialBody>();
			CelestialBody parentBody = thisVessel.mainBody;
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

			Orbit orbit = thisVessel.orbit;
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
}

