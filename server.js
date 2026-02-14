import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock Data / Real API Integration
// In a real scenario, you'd use env vars for keys: process.env.AUSPOST_KEY
const CARRIERS = {
    AUSPOST: {
        name: "Australia Post",
        // Example only. Real integration requires specific headers/auth.
        track: async (trackingNumber) => {
            // Mock response for demo
            return {
                carrier: "Australia Post",
                trackingNumber,
                status: "In Transit",
                estimatedDelivery: "2026-02-18",
                events: [
                    { time: "2026-02-14 09:00", description: "Picked up by driver", location: "Sydney, NSW" },
                    { time: "2026-02-13 15:30", description: "Processed at facility", location: "Chullora, NSW" },
                ]
            };
        }
    },
    FEDEX: {
        name: "FedEx",
        track: async (trackingNumber) => {
            return {
                carrier: "FedEx",
                trackingNumber,
                status: "Delivered",
                estimatedDelivery: "2026-02-10",
                events: [
                    { time: "2026-02-10 14:20", description: "Delivered", location: "Melbourne, VIC" },
                    { time: "2026-02-09 08:45", description: "On vehicle for delivery", location: "Melbourne, VIC" },
                ]
            };
        }
    },
    UNKNOWN: {
        name: "Unknown Carrier",
        track: async (trackingNumber) => {
            return {
                carrier: "Unknown",
                trackingNumber,
                status: "Not Found",
                error: "Could not identify carrier pattern or tracking number not found."
            };
        }
    }
};

// Auto-detect carrier based on regex patterns
const detectCarrier = (trackingNumber) => {
    // Simple regex patterns (approximations)
    if (/^(EM|CP|VV)[A-Z0-9]+AU$/.test(trackingNumber) || /^[0-9]{20,22}$/.test(trackingNumber)) return 'AUSPOST';
    if (/^[0-9]{12}$/.test(trackingNumber) || /^[0-9]{15}$/.test(trackingNumber)) return 'FEDEX';
    // Fallback/Default
    return 'AUSPOST'; // Defaulting to AusPost for demo purposes if not clear
};

app.get('/api/track/:trackingNumber', async (req, res) => {
    const { trackingNumber } = req.params;
    console.log(`Tracking request for: ${trackingNumber}`);

    // 1. Detect Carrier
    const carrierKey = detectCarrier(trackingNumber);
    const carrier = CARRIERS[carrierKey] || CARRIERS.UNKNOWN;

    try {
        // 2. Fetch Data (Mock or Real)
        const data = await carrier.track(trackingNumber);
        res.json(data);
    } catch (error) {
        console.error("Tracking Error:", error);
        res.status(500).json({ error: "Failed to track parcel" });
    }
});

// Serve frontend in production (optional for dev)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
}

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
