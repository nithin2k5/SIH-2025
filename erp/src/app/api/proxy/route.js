// API Proxy to handle CORS issues with Google Apps Script
import { NextResponse } from 'next/server';

const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbwtoVt7O1YK6L0gjEYzNzCSadACHYSKWLyssuMAlbC04eZfq7QTMEY_n85uTcqOChhU/exec';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
    }

    // Forward all other query parameters
    const gasUrl = new URL(GAS_BASE_URL);
    gasUrl.searchParams.set('path', path);
    gasUrl.searchParams.set('_server', 'true'); // Indicate this is a server request

    // Copy other parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'path') {
        gasUrl.searchParams.set(key, value);
      }
    }

    console.log(`Proxying GET request to: ${gasUrl.toString()}`);

    const response = await fetch(gasUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GAS API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();

    // Check if response is HTML (login page)
    if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<HTML') || responseText.trim().startsWith('<html')) {
      throw new Error(`GAS returned HTML login page instead of JSON. The web app requires authentication. Response: ${responseText.substring(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(`Invalid JSON response from GAS: ${responseText.substring(0, 200)}`);
    }
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    // console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
    }

    const body = await request.json();

    const gasUrl = `${GAS_BASE_URL}?path=${path}`;

    console.log(`Proxying POST request to: ${gasUrl}`);
    console.log('Request body:', body);

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`GAS API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    // console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
