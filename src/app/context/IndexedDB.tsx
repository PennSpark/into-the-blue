import { keys, del } from 'idb-keyval';


const DB_NAME = "ImageDatabase";
const STORE_NAME = "images";
const METRICS_STORE = "metrics";
const STICKERS_STORE = "stickers";

interface StickerData {
	id: number;
	imageName: string;
	x: number;
	y: number;
	width: number;
	aspectRatio: number;
	rotation: number;
	isLabel: boolean;
	src?: string;
}
/* IndexedDB Structure */
// - images (store for image blobs)
// - metrics (store for app metrics)
//   - name (string, e.g. "stats")
//   - totalObjectsFound (number)
//   - totalExhibitsVisited (number)
//   - startTime (number)
//   - stickerbookViewTime (number)

// FoundObjectsArrays
// - exhibit (string)
//   - objectId (string)
//   - found (boolean)

{
	/* open db, TODO: initialize found objects array */
}
export const openDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 5); // bump version if needed

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, {
					keyPath: "id",
					autoIncrement: true,
				});
			}
			if (!db.objectStoreNames.contains(METRICS_STORE)) {
				// Use a stable key so we can update our metric object later.
				db.createObjectStore(METRICS_STORE, { keyPath: "name" });
			}
			if (!db.objectStoreNames.contains(STICKERS_STORE)) {
				// Use a stable key so we can update our metric object later.
				db.createObjectStore(STICKERS_STORE, { keyPath: "id" });
			}
			if (!db.objectStoreNames.contains("gridSettings")) {
				db.createObjectStore("gridSettings", { keyPath: "id" });
			}

			// NEW: Create store for collected artifacts if not present.
			if (!db.objectStoreNames.contains("collectedArtifacts")) {
				db.createObjectStore("collectedArtifacts", { keyPath: "id" });
			}
			// NEW: Create store for visited exhibits if not present.
			if (!db.objectStoreNames.contains("visitedExhibits")) {
				db.createObjectStore("visitedExhibits", { keyPath: "id" });
			}

			if (!db.objectStoreNames.contains("tutorial")) {
				db.createObjectStore("tutorial", { keyPath: "id" });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
};

// Utility: Convert a data URL (base64) to a Blob.
export const dataURLtoBlob = (dataURL: string): Blob => {
	const byteString = atob(dataURL.split(",")[1]);
	const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
	const arrayBuffer = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i++) {
		arrayBuffer[i] = byteString.charCodeAt(i);
	}
	return new Blob([arrayBuffer], { type: mimeString });
};

export const loadImageByName = async (
	imageName: string
): Promise<string | null> => {
	const db = await openDB();
	const transaction = db.transaction(STORE_NAME, "readonly");
	const store = transaction.objectStore(STORE_NAME);
	const request = store.get(imageName);

	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			const result = request.result;
			if (result && result.image instanceof Blob) {
				resolve(URL.createObjectURL(result.image));
			} else {
				resolve(null);
			}
		};
		request.onerror = () => reject("Failed to load image by name");
	});
};

//save image, if image with same name exists replace it (for simplicity's sake)
export const saveImage = async (
	imageData: string,
	imageName: string,
	exhibitId?: string
) => {
	const imageBlob = dataURLtoBlob(imageData);
	const db = await openDB();

	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, "readwrite");
		const store = transaction.objectStore(STORE_NAME);

		const putImage = () => {
			const putRequest = store.put({
				id: imageName,
				image: imageBlob,
				timestamp: Date.now(),
			});
			putRequest.onsuccess = async () => {
				try {
					const isNew = await addCollectedArtifact(imageName);
					if (isNew) {
						await updateTotalObjectsFound(1);
					}
					// If an exhibit ID was provided, mark it as visited.
					if (exhibitId) {
						await addVisitedExhibit(exhibitId);
					}
					resolve();
				} catch {
					reject(
						"Image saved but failed to update collected artifacts or metrics"
					);
				}
			};
			putRequest.onerror = () => {
				reject("Failed to save image");
			};
		};

		// Check if an image with the same name already exists; if so, delete it first.
		const getRequest = store.get(imageName);
		getRequest.onsuccess = () => {
			if (getRequest.result) {
				const deleteRequest = store.delete(imageName);
				deleteRequest.onsuccess = () => putImage();
				deleteRequest.onerror = () =>
					reject("Failed to delete old image before saving new one");
			} else {
				putImage();
			}
		};
		getRequest.onerror = () => reject("Failed to check for existing image");

		transaction.oncomplete = () => {
			resolve();
		};

		transaction.onerror = () => {
			reject("Transaction failed");
		};
	});
};

//retrieve all images
export const loadAllImages = async (): Promise<
	{ id: string; url: string }[]
> => {
	const db = await openDB();
	const transaction = db.transaction(STORE_NAME, "readonly");
	const store = transaction.objectStore(STORE_NAME);
	const request = store.getAll();

	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			const images = request.result
				.filter(
					(item): item is { id: string; image: Blob } =>
						item && item.image instanceof Blob
				)
				.map((item) => ({
					id: item.id,
					url: URL.createObjectURL(item.image),
				}));
			resolve(images);
		};
		request.onerror = () => reject("Failed to load images");
	});
};

// In src/app/context/IndexedDB.js
export async function clearIntroAnimations() {
    try {
        // Get all keys in the database
        const allKeys = await keys();
        
        // Filter for keys that start with "seenIntro-"
        const introKeys = allKeys.filter(key => 
            typeof key === 'string' && key.startsWith('seenIntro-')
        );
        
        // Delete each key
        await Promise.all(introKeys.map(key => del(key)));
        
        console.log(`Cleared ${introKeys.length} intro animation flags`);
    } catch (error) {
        console.error('Error clearing intro animations:', error);
    }
}

export async function clearTutorialCompletion() {
	try {
	  const db = await openDB();
	  const tx = db.transaction("tutorial", "readwrite");
	  const store = tx.objectStore("tutorial");
	  store.delete("main");
	  
	  return new Promise<void>((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject("Failed to clear tutorial completion");
	  });
	} catch (error) {
	  console.error('Error clearing tutorial completion:', error);
	}
  }

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

{
	/*modify exhibit array that user found*/
}
export const modifyArray = async () => {
	const db = await openDB();
	const transaction = db.transaction(STORE_NAME, "readwrite");
	const store = transaction.objectStore(STORE_NAME);
	const request = store.getAll();

	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			const images = request.result
				.filter(
					(item): item is { image: Blob } => item && item.image instanceof Blob
				)
				.map((item) => URL.createObjectURL(item.image));

			resolve(images);
		};
		request.onerror = () => reject("Failed to load images");
	});
};

{
	/*pull array by exhbit*/
}
export const pullArray = async (): Promise<string[]> => {
	const db = await openDB();
	const transaction = db.transaction(STORE_NAME, "readonly");
	const store = transaction.objectStore(STORE_NAME);
	const request = store.getAll();

	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			const images = request.result
				.filter(
					(item): item is { image: Blob } => item && item.image instanceof Blob
				)
				.map((item) => URL.createObjectURL(item.image));

			resolve(images);
		};
		request.onerror = () => reject("Failed to load images");
	});
};

interface ExhibitItem {
	id: string;
	// add additional exhibit item properties here if needed
}

interface Exhibit {
	displayName: string;
	description: string;
	items: ExhibitItem[];
	path: string;
}

const fetchExhibitData = async (): Promise<Record<string, Exhibit>> => {
	const response = await fetch("/sites/blue/data/exhibits.json");
	if (!response.ok) throw new Error("Failed to load exhibit data");
	return response.json();
};

export const getFoundObjectsForExhibit = async (
	exhibitKey: string
): Promise<string[]> => {
	const exhibitData = await fetchExhibitData(); // fetch from public directory

	const db = await openDB();
	const transaction = db.transaction(STORE_NAME, "readonly");
	const store = transaction.objectStore(STORE_NAME);

	const exhibit = exhibitData[exhibitKey];
	if (!exhibit) {
		console.error(`Exhibit "${exhibitKey}" not found`);
		return [];
	}

	const allItemIds = exhibit.items.map((item: ExhibitItem) => item.id);
	const foundIds: string[] = [];

	await Promise.all(
		allItemIds.map(async (id) => {
			const getRequest = store.get(id);
			await new Promise<void>((resolve) => {
				getRequest.onsuccess = () => {
					if (getRequest.result && getRequest.result.image instanceof Blob) {
						foundIds.push(id);
					}
					resolve();
				};
				getRequest.onerror = () => resolve(); // skip errors
			});
		})
	);

	return foundIds;
};

// ------------------------
// Metrics functions
// ------------------------

// Save (or update) metrics in the database.
// We use "stats" as the key name.
export const saveMetrics = async (metrics: {
	totalObjectsFound: number;
	totalExhibitsVisited: number;
	startTime: number;
	stickerbookViewTime: number;
}): Promise<void> => {
	const db = await openDB();
	const transaction = db.transaction(METRICS_STORE, "readwrite");
	const store = transaction.objectStore(METRICS_STORE);
	// Use a fixed key "stats" so you can update it later.
	const data = { name: "stats", ...metrics };
	store.put(data);
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject("Failed to save metrics");
	});
};

// Retrieve stored metrics.
export const getMetrics = async (): Promise<{
	totalObjectsFound: number;
	totalExhibitsVisited: number;
	startTime: number;
	stickerbookViewTime: number;
} | null> => {
	const db = await openDB();
	const transaction = db.transaction(METRICS_STORE, "readonly");
	const store = transaction.objectStore(METRICS_STORE);
	const request = store.get("stats");
	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result || null);
		};
		request.onerror = () => {
			reject("Failed to get metrics");
		};
	});
};

// Example: Update the total number of objects found.
export const updateTotalObjectsFound = async (
	increment: number = 1
): Promise<void> => {
	const currentMetrics = await getMetrics();
	const newMetrics = {
		totalObjectsFound: (currentMetrics?.totalObjectsFound || 0) + increment,
		totalExhibitsVisited: currentMetrics?.totalExhibitsVisited || 0,
		startTime: currentMetrics?.startTime || Date.now(),
		stickerbookViewTime: currentMetrics?.stickerbookViewTime || 0,
	};
	await saveMetrics(newMetrics);
};

// Similarly you can create functions for updating totalExhibitsVisited, startTime and stickerbookViewTime.

export const updateTotalExhibitsVisited = async (
	increment: number = 1
): Promise<void> => {
	const currentMetrics = await getMetrics();
	const newMetrics = {
		totalObjectsFound: currentMetrics?.totalObjectsFound || 0,
		totalExhibitsVisited:
			(currentMetrics?.totalExhibitsVisited || 0) + increment,
		startTime: currentMetrics?.startTime || Date.now(),
		stickerbookViewTime: currentMetrics?.stickerbookViewTime || 0,
	};
	await saveMetrics(newMetrics);
};

// Modified addCollectedArtifact that returns a boolean indicating if the artifact was new.
export const addCollectedArtifact = async (
	artifactId: string
): Promise<boolean> => {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction("collectedArtifacts", "readwrite");
		const store = transaction.objectStore("collectedArtifacts");

		// First, check if this artifact is already collected.
		const getRequest = store.get(artifactId);
		getRequest.onsuccess = () => {
			if (getRequest.result) {
				// Already collected – do nothing.
				resolve(false);
			} else {
				// Not collected yet – add it.
				const putRequest = store.put({ id: artifactId, timestamp: Date.now() });
				putRequest.onsuccess = () => resolve(true);
				putRequest.onerror = () => reject("Failed to add collected artifact");
			}
		};
		getRequest.onerror = () => reject("Failed to check collected artifact");
	});
};

export const addVisitedExhibit = async (exhibitId: string): Promise<void> => {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction("visitedExhibits", "readwrite");
		const store = transaction.objectStore("visitedExhibits");

		// Check if the exhibit is already registered as visited.
		const request = store.get(exhibitId);
		request.onsuccess = async () => {
			if (!request.result) {
				// Not visited yet: mark as visited and update metric.
				const addRequest = store.put({ id: exhibitId, timestamp: Date.now() });
				addRequest.onsuccess = async () => {
					try {
						await updateTotalExhibitsVisited(1);
						resolve();
					} catch {
						reject("Failed to update total exhibits visited");
					}
				};
				addRequest.onerror = () => {
					reject("Failed to add visited exhibit");
				};
			} else {
				// Already visited, do nothing.
				resolve();
			}
		};
		request.onerror = () => reject("Failed to check visited exhibit");
	});
};

export const loadCollectedArtifacts = async (): Promise<string[]> => {
	const db = await openDB();
	const transaction = db.transaction("collectedArtifacts", "readonly");
	const store = transaction.objectStore("collectedArtifacts");
	const request = store.getAll();
	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			// Return an array of artifact IDs
			const artifacts = request.result || [];
			resolve(artifacts.map((item: { id: string }) => item.id));
		};
		request.onerror = () => reject("Failed to load collected artifacts");
	});
};

// NEW: Clear collectedArtifacts store
export const clearCollectedArtifacts = async (): Promise<void> => {
	const db = await openDB();
	const transaction = db.transaction("collectedArtifacts", "readwrite");
	const store = transaction.objectStore("collectedArtifacts");
	store.clear();
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject("Failed to clear collected artifacts");
	});
};

// NEW: Clear visitedExhibits store
export const clearVisitedExhibits = async (): Promise<void> => {
	const db = await openDB();
	const transaction = db.transaction("visitedExhibits", "readwrite");
	const store = transaction.objectStore("visitedExhibits");
	store.clear();
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject("Failed to clear visited exhibits");
	});
};

export const loadAllStickers = async (): Promise<StickerData[]> => {
	const db = await openDB();

	const stickerTx = db.transaction("stickers", "readonly");
	const stickerStore = stickerTx.objectStore("stickers");
	const stickerRequest = stickerStore.getAll();

	return new Promise((resolve, reject) => {
		stickerRequest.onsuccess = async () => {
			const rawStickers = stickerRequest.result;

			const stickersWithUrls: StickerData[] = await Promise.all(
				rawStickers.map(async (s: StickerData) => {
					try {
						const imgTx = db.transaction("images", "readonly"); // ✅ open a new transaction
						const imageStore = imgTx.objectStore("images");
						const imgReq = imageStore.get(s.imageName);

						return new Promise<StickerData>((res) => {
							imgReq.onsuccess = () => {
								const blob = imgReq.result?.image;
								const url =
									blob instanceof Blob ? URL.createObjectURL(blob) : "";
								res({
									...s,
									src: url,
								});
							};
							imgReq.onerror = () => {
								res({ ...s, src: "" });
							};
						});
					} catch {
						return { ...s, src: "" };
					}
				})
			);

			resolve(stickersWithUrls);
		};

		stickerRequest.onerror = () => reject("Failed to load stickers");
	});
};

export const saveSticker = async (sticker: {
	id: number;
	imageName: string;
	x: number;
	y: number;
	width: number;
	rotation: number;
	isLabel: boolean;
}): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction("stickers", "readwrite");
	const store = tx.objectStore("stickers");
	store.put(sticker);
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject("Failed to save sticker");
	});
};

export const deleteStickerById = async (id: number): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction(STICKERS_STORE, "readwrite");
	const store = tx.objectStore(STICKERS_STORE);
	store.delete(id);

	await store.delete(id); // <-- this is critical: await the request
	await tx.oncomplete;

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject("Failed to delete sticker");
	});
};

export const logDatabaseState = async (): Promise<void> => {
	const db = await openDB();

	const logStoreContents = async (storeName: string) => {
		const tx = db.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);
		const request = store.getAll();

		return new Promise<void>((resolve) => {
			request.onsuccess = () => {
				console.log(`📦 ${storeName} store:`);
				request.result.forEach((item: unknown, index: number) => {
					console.log(`  #${index + 1}`, item);
				});
				resolve();
			};
			request.onerror = () => {
				console.warn(`❌ Failed to read from ${storeName}`);
				resolve();
			};
		});
	};

	console.group("📂 IndexedDB State");
	await Promise.all([
		logStoreContents("images"),
		logStoreContents("metrics"),
		logStoreContents("stickers"),
		logStoreContents("collectedArtifacts"),
		logStoreContents("visitedExhibits"),
		logStoreContents("tutorial"),
	]);
	console.groupEnd();
};

export const saveGridBg = async (color: string): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction("gridSettings", "readwrite");
	const store = tx.objectStore("gridSettings");
	store.put({ id: "gridBg", color });
	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject("Failed to save grid background");
	});
};

export const loadGridBg = async (): Promise<string | null> => {
	const db = await openDB();
	const tx = db.transaction("gridSettings", "readonly");
	const store = tx.objectStore("gridSettings");
	const request = store.get("gridBg");
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result?.color ?? null);
		request.onerror = () => reject("Failed to load grid background");
	});
};

// Clear the gridSettings store
export const clearGridSettings = async (): Promise<void> => {
	const db = await openDB();
	const transaction = db.transaction("gridSettings", "readwrite");
	const store = transaction.objectStore("gridSettings");
	store.clear();
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject("Failed to clear grid settings");
	});
};

export const clearStickers = async (): Promise<void> => {
	const db = await openDB();
	const transaction = db.transaction(STICKERS_STORE, "readwrite");
	const store = transaction.objectStore(STICKERS_STORE);
	store.clear();
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject("Failed to clear stickers");
	});
};

export const getTutorialCompleted = async (): Promise<boolean> => {
	const db = await openDB();
	const tx = db.transaction("tutorial", "readonly");
	const store = tx.objectStore("tutorial");
	const request = store.get("main");

	return new Promise((resolve, reject) => {
		request.onsuccess = () => {
			resolve(request.result?.completed === true);
		};
		request.onerror = () => reject("Failed to get tutorial completion");
	});
};

export const setTutorialCompleted = async (): Promise<void> => {
	const db = await openDB();
	const tx = db.transaction("tutorial", "readwrite");
	const store = tx.objectStore("tutorial");
	store.put({ id: "main", completed: true });

	return new Promise((resolve, reject) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject("Failed to save tutorial completion");
	});
};

// Add this function to the end of your IndexedDB.tsx file

export const cleanupTestImage = async (): Promise<void> => {
  try {
    // 1. Delete the test image
    const db = await openDB();
    const imageTransaction = db.transaction(STORE_NAME, "readwrite");
    const imageStore = imageTransaction.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = imageStore.delete("test-private-mode");
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject("Failed to delete test image");
    });

    // 2. Remove the artifact from collected artifacts
    const artifactTransaction = db.transaction("collectedArtifacts", "readwrite");
    const artifactStore = artifactTransaction.objectStore("collectedArtifacts");
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = artifactStore.delete("test-private-mode");
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject("Failed to delete test artifact");
    });

    // 3. Remove the test exhibit from visited exhibits
    if ("test") {
      const exhibitTransaction = db.transaction("visitedExhibits", "readwrite");
      const exhibitStore = exhibitTransaction.objectStore("visitedExhibits");
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = exhibitStore.delete("test");
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject("Failed to delete test exhibit");
      });
    }

    // 4. Decrement the totalObjectsFound count if needed
    const currentMetrics = await getMetrics();
    if (currentMetrics && currentMetrics.totalObjectsFound > 0) {
      await saveMetrics({
        ...currentMetrics,
        totalObjectsFound: currentMetrics.totalObjectsFound - 1,
        totalExhibitsVisited: currentMetrics.totalExhibitsVisited > 0 ? 
                             currentMetrics.totalExhibitsVisited - 1 : 0
      });
    }
    
    console.log("✅ Test data successfully cleaned up");
  } catch (error) {
    console.error("Failed to cleanup test image:", error);
  }
};
