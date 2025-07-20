import { baseUrl } from "../others/base-url";

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