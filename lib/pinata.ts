"use server";

export async function uploadFileToPinata(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    const data = new FormData();
    data.append("file", file);
    data.append("pinataMetadata", JSON.stringify({
      name: file.name,
    }));
    data.append("pinataOptions", JSON.stringify({
      cidVersion: 1,
    }));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload file to Pinata: ${res.statusText}`);
    }

    const json = await res.json();
    return {
      success: true,
      ipfsHash: json.IpfsHash,
      pinSize: json.PinSize,
      timestamp: json.Timestamp,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return { success: false, error: "Failed to upload file" };
  }
}

export async function uploadJSONToPinata(jsonBody: any, name: string) {
  try {
    const data = JSON.stringify({
      pinataContent: jsonBody,
      pinataMetadata: {
        name: name,
      },
    });

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload JSON to Pinata: ${res.statusText}`);
    }

    const json = await res.json();
    return {
      success: true,
      ipfsHash: json.IpfsHash,
    };
  } catch (error) {
    console.error("Error uploading JSON to Pinata:", error);
    return { success: false, error: "Failed to upload JSON" };
  }
}
