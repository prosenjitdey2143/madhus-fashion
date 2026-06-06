import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./firebaseConfig"

export interface VideoData {
  id?: string
  title: string
  videoUrl: string
  type: 'mp4' | 'facebook'
  priority?: number
  createdAt?: any
}

const COLLECTION_NAME = "videos"

export const videoService = {
  async getAllVideos(): Promise<VideoData[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    const videos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as VideoData[]
    
    return videos.sort((a, b) => {
      const priorityA = a.priority ?? 999999
      const priorityB = b.priority ?? 999999
      return priorityA - priorityB
    })
  },

  async getVideoById(id: string): Promise<VideoData | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as VideoData
    }
    return null
  },

  async createVideo(data: Omit<VideoData, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp()
    })
    return docRef.id
  },

  async updateVideo(id: string, data: Partial<VideoData>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, { ...data })
  },

  async deleteVideo(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  }
}
