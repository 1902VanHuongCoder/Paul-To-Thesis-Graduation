
export const fetchProvinceList = async () => {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
    const data = await res.json();
    return data;
}

export const fetchDistrictList = async (provinceCode: string) => {
    const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = await res.json();
    return data.districts;
}

export const fetchWardList = async (districtCode: string) => {
    const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const data = await res.json();
    return data.wards;
}
export const fetchAddressDetails = async (wardCode: string) => {
    const res = await fetch(`https://provinces.open-api.vn/api/w/${wardCode}?depth=2`);
    const data = await res.json();
    return data;
}