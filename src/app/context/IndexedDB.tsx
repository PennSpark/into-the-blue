const DB_NAME = "ImageDatabase";
const STORE_NAME = "images";

{/*IndexedDB Structure*/}
// ImageDatabase
// - images
//   - id (TODO: find out if it's search-able)
//   - image (Blob)
//   - timestamp (number)

// FoundObjectsArrays
// - exhibit (string)
//   - objectId (string)
//   - found (boolean)

{/* open db, TODO: initialize found objects array */}
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

//dataurl to blob
export const dataURLtoBlob = (dataURL: string): Blob => {
  const byteString = atob(dataURL.split(",")[1]);
  const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
  const arrayBuffer = new Uint8Array(byteString.length);
  
  for (let i = 0; i < byteString.length; i++) {
    arrayBuffer[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([arrayBuffer], { type: mimeString });
};

//save image, if image with same name exists replace it (for simplicity's sake)
export const saveImage = async (imageData: string, imageName: string) => {
  const imageBlob = dataURLtoBlob(imageData);
  const db = await openDB();

  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);

  const existingImageRequest = store.get(imageName);

  return new Promise<void>((resolve, reject) => {
    existingImageRequest.onsuccess = () => {
      if (existingImageRequest.result) {
        store.delete(imageName);
      }

      store.put({ id: imageName, image: imageBlob, timestamp: Date.now() });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject("Failed to save image");
    };

    existingImageRequest.onerror = () => reject("Failed to check for existing image");
  });
};


//retrieve last stored image 
export const loadLastImage = async (): Promise<string | null> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const images = request.result.map((item: { image: Blob }) =>
        URL.createObjectURL(item.image)
      );
      resolve(images.length ? images[images.length - 1] : null);
    };
    request.onerror = () => reject("Failed to load image");
  });
};

//retrieve all images
export const loadAllImages = async (): Promise<string[]> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const images = request.result.map((item: { image: Blob }) =>
        URL.createObjectURL(item.image)
      );
      resolve(images);
    };
    request.onerror = () => reject("Failed to load images");
  });
};

//delete images (for convenience)
export const clearImages = async () => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  store.clear();

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject("Failed to clear images");
  });
};

{/*modify exhibit array that user found*/}
export const modifyArray = async (exhibit: string, objectId: string) => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const images = request.result.map((item: { image: Blob }) =>
        URL.createObjectURL(item.image)
      );
      resolve(images);
    };
    request.onerror = () => reject("Failed to load images");
  });
}

{/*pull array by exhbit*/}
export const pullArray = async (exhibit: string): Promise<string[]> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const images = request.result.map((item: { image: Blob }) =>
        URL.createObjectURL(item.image)
      );
      resolve(images);
    };
    request.onerror = () => reject("Failed to load images");
  });
}

{/*load images that user found from a certain exhibit*/}
export const loadFoundImages = async (exhibit: string): Promise<string[]> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const images = request.result.map((item: { image: Blob }) =>
        URL.createObjectURL(item.image)
      );
      resolve(images);
    };
    request.onerror = () => reject("Failed to load images");
  });
}
