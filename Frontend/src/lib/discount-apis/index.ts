import { baseUrl } from "../others/base-url";
type Discount = {
  discountID: string;
  discountDescription: string;
  discountPercent: number;
  expireDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};
export const checkPromotionCode = async (code: string) => {
    try {
        const response = await fetch(`${baseUrl}/api/discount/${code}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error('Failed to check promotion code');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking promotion code:', error);
        throw error;
    }
}

export const createDiscount = async (discountData: Discount) => {
    try {
        const response = await fetch(`${baseUrl}/api/discount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discountData),
        });

        if (!response.ok) {
            throw new Error('Failed to create discount');
        }
        return response.json();
    } catch (error) {
        console.error('Error creating discount:', error);
        throw error;
    }
}
export const fetchAllDiscounts = async () => {
    try {
        const response = await fetch(`${baseUrl}/api/discount`);
        if (!response.ok) {
            throw new Error('Failed to fetch discounts');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching discounts:', error);
        throw error;
    }
}

export const updateDiscount = async (discountData: Discount) => {
    try {
        const response = await fetch(`${baseUrl}/api/discount/${discountData.discountID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discountData),
        });

        if (!response.ok) {
            throw new Error('Failed to update discount');
        }
        return response.ok;
    } catch (error) {
        console.error('Error updating discount:', error);
        throw error;
    }
}

export const deleteDiscount = async (discountId: string) => {
    try {
        const response = await fetch(`${baseUrl}/api/discount/${discountId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete discount');
        }
        return response.ok;
    } catch (error) {
        console.error('Error deleting discount:', error);
        throw error;
    }
}