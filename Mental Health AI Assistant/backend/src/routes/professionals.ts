import express from 'express';

const router = express.Router();

// Mock professional directory
const professionals = [
    {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "Clinical Psychology",
        phone: "(555) 123-4567",
        location: "Downtown Mental Health Center",
        availability: "Mon-Fri 9AM-5PM"
    },
    {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Psychiatry",
        phone: "(555) 234-5678",
        location: "Community Health Services",
        availability: "Tue-Thu 10AM-6PM"
    },
    {
        id: 3,
        name: "Lisa Rodriguez, LCSW",
        specialty: "Trauma Therapy",
        phone: "(555) 345-6789",
        location: "Healing Center",
        availability: "Mon-Wed 8AM-4PM"
    }
];

const crisisResources = [
    {
        name: "988 Suicide & Crisis Lifeline",
        phone: "988",
        description: "24/7 crisis support",
        type: "crisis"
    },
    {
        name: "Crisis Text Line",
        phone: "741741",
        description: "Text HOME for crisis support",
        type: "crisis"
    },
    {
        name: "National Alliance on Mental Illness",
        phone: "(800) 950-6264",
        description: "Mental health information and support",
        type: "support"
    }
];

// Get all professionals
router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        res.json({
            success: true,
            professionals,
            crisisResources,
            status: 'Professional referral system is working'
        });
    } catch (error) {
        console.error('Professionals list error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get professionals list'
        });
    }
});

// Get crisis resources
router.get('/crisis', async (req: express.Request, res: express.Response) => {
    try {
        res.json({
            success: true,
            crisisResources,
            status: 'Crisis resources available'
        });
    } catch (error) {
        console.error('Crisis resources error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get crisis resources'
        });
    }
});

export { router as professionalsRoutes };