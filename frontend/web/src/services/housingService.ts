
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { trackEvent } from "@/lib/firebase";

interface HousingSearchParams {
  location: string;
  housingType: string;
  budget: string;
  timeline: string;
}

interface HousingOption {
  id: string;
  name: string;
  type: string;
  price: number;
  address: string;
  description: string;
  availableDate?: Date;
  contactInfo?: string;
  requirements?: string[];
}

/**
 * Get housing options based on search parameters
 */
export async function getHousingOptions(params: HousingSearchParams): Promise<HousingOption[]> {
  try {
    // Track the search event
    trackEvent("housing_search", {
      location: params.location,
      housingType: params.housingType,
      budget: params.budget,
      timeline: params.timeline
    });
    
    // Parse the budget as a number for comparison
    const budgetValue = parseInt(params.budget.replace(/[^0-9]/g, ''));
    const maxBudget = budgetValue || 2000; // Default if parsing fails
    
    // Create search record in Firestore
    await addDoc(collection(db, "housing_searches"), {
      ...params,
      budgetValue: maxBudget,
      timestamp: serverTimestamp()
    });
    
    // Query housing options from Firestore
    const housingRef = collection(db, "housing_options");
    const q = query(
      housingRef,
      where("zip", "==", params.location.length === 5 && /^\d+$/.test(params.location) ? params.location : "48104"),
      where("price", "<=", maxBudget),
      orderBy("price", "asc"),
      limit(5)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If no exact matches, do a more flexible search
      const fallbackQuery = query(
        housingRef,
        where("price", "<=", maxBudget * 1.2), // Allow slightly higher budget
        orderBy("price", "asc"),
        limit(3)
      );
      
      const fallbackSnapshot = await getDocs(fallbackQuery);
      
      return fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HousingOption[];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HousingOption[];
  } catch (error) {
    console.error("Error fetching housing options:", error);
    
    // Return empty array on error
    return [];
  }
}
