import { GoogleGenAI } from '@google/genai';
import { TelemetryData } from '../hooks/useTelemetry';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function predictFailures(telemetry: TelemetryData) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a specialized CERN anomaly detection AI. 
        Analyze this particle accelerator telemetry and identify the most likely "failure zone".
        
        Telemetry Data:
        - Beam Intensity: ${telemetry.beamIntensity}
        - Status: ${telemetry.status}
        - Nodes With Warnings: ${telemetry.nodes.filter(n => n.status !== 'OK').length}
        - Sample Cluster State: ${JSON.stringify(telemetry.nodes.slice(0, 5))}

        Return a short technical assessment (max 30 words) focusing on thermal drift or magnetic misalignment risks.
      `,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Prediction Error:', error);
    return "AI Core currently offline. Proceed with manual diagnostics.";
  }
}
