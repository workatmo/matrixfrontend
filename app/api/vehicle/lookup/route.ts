import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { registration_number } = await request.json();

    if (!registration_number || registration_number.trim() === "") {
      return NextResponse.json(
        { error: "Registration number is required" },
        { status: 400 }
      );
    }

    const regUpper = registration_number.toUpperCase().replace(/\s/g, "");

    // Proxy request to Laravel Backend API
    const backendUrl = process.env.LARAVEL_PROXY_TARGET 
      ? `${process.env.LARAVEL_PROXY_TARGET}/api` 
      : "http://127.0.0.1:8000/api";
    
    const response = await fetch(`${backendUrl}/vehicle/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ registration_number: regUpper }),
    });

    const data = await response.json();

    if (!response.ok || data.status === false) {
      let errorMessage = data.message || data.data?.dvla_error || "Vehicle not found. Please check registration number.";
      
      // Improve the generic API error message for users
      if (errorMessage.includes("DVLA request rejected") || errorMessage.includes("Not Found")) {
        errorMessage = "We couldn't find a vehicle with that registration number. Please double-check and try again.";
      } else if (errorMessage.includes("API Settings") || errorMessage.toLowerCase().includes("disabled")) {
        errorMessage = "Vehicle lookup service is currently unavailable. Please try again later.";
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status === 200 ? 503 : response.status }
      );
    }

    return NextResponse.json(data.data); // Return the payload containing both vehicle and tyre details
  } catch (error) {
    console.error("Backend fetch error:", error);
    return NextResponse.json(
      { error: "Failed to process request to backend. Check console logs." },
      { status: 500 }
    );
  }
}
