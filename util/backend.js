export const uploadImageUrisToCloudinary = async (uriArray) => {
    const uploadedUrls = [];
  
    for (let i = 0; i < uriArray.length; i++) {
      const uri = uriArray[i];
      const filename = uri.split("/").pop() || `image_${i}.jpg`;
      const fileTypeMatch = /\.(\w+)$/.exec(filename);
      const type = fileTypeMatch ? `image/${fileTypeMatch[1]}` : `image/jpeg`;
  
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: filename,
        type,
      });
  
      try {
        const response = await fetch("http://192.168.180.24:3000/upload", {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });
  
        const data = await response.json();
  
        if (data.url) {
          uploadedUrls.push(data.url);
        } else {
          console.warn("❌ Upload failed for:", uri);
        }
      } catch (err) {
        console.error("❌ Upload error:", err.message);
      }
    }
  
    return uploadedUrls;
  };
  