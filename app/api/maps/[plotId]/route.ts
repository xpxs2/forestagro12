
// src/app/api/maps/[plotId]/route.ts

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

// This is our mock database for now. In a real app, you'd fetch this from Firestore or another DB.
const defaultSamplePlot = {
    polygon: [
        { lat: -41.33574235, lng: 174.8607354 },
        { lat: -41.33843617, lng: 174.8625929 },
        { lat: -41.33632563, lng: 174.8749833 },
        { lat: -41.32750895, lng: 174.8943239 },
        { lat: -41.32283498, lng: 174.8918952 },
        { lat: -41.32764482, lng: 174.8792559 },
        { lat: -41.33226155, lng: 174.8619469 },
        { lat: -41.33574235, lng: 174.8607354 },
    ],
};

export async function GET(
    request: Request,
    { params }: { params: { plotId: string } }
) {
    // The plotId is received, but for now, we always use the default sample polygon.
    // Later, this ID will be used to look up specific plot data in a database.
    const plotId = params.plotId;

    const apiKey = process.env.MAPBOX_API_KEY;

    if (!apiKey) {
        // If the key is missing, return a 500 server error
        return new NextResponse('Mapbox API key is not configured on the server.', { status: 500 });
    }

    // Securely fetch the polygon data on the server
    const polygon = defaultSamplePlot.polygon;

    const geoJson = {
        type: 'Polygon',
        coordinates: [polygon.map(p => [p.lng, p.lat])],
    };

    // Construct the Mapbox URL on the server, keeping coordinates and API key private
    const geoJsonString = encodeURIComponent(JSON.stringify(geoJson));
    const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/geojson(${geoJsonString})/auto/600x350?access_token=${apiKey}`;

    try {
        // Fetch the image from Mapbox from our server
        const imageResponse = await fetch(mapboxUrl);

        if (!imageResponse.ok) {
            // If Mapbox returns an error, forward that error
            return new NextResponse('Failed to fetch map image from Mapbox.', { status: imageResponse.status });
        }

        // Get the image data as a blob
        const imageBlob = await imageResponse.blob();

        // Return the image data to the client with the correct content type
        return new NextResponse(imageBlob, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
            },
        });

    } catch (error) {
        return new NextResponse('Error fetching map image.', { status: 500 });
    }
}
