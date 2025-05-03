import React from "react";
export default function TopHeader() {
    return (
        <div className="hidden sm:flex bg-primary text-white py-4 px-8 items-center justify-between font-sans text-sm w-full">
            {/* Left Section */}
            <div className="flex items-center max-w-[300px] py-2 rounded-lg capitalize bg-white/10 px-4 font-normal">
                <span>Chào mừng đến với NFeamHouse</span>
            </div>

            <div className="flex items-center gap-x-8">
                {/* Center Section */}
                <div className="flex items-center gap-6">
                    {/* Phone */}
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-secondary rounded-full"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 26 26"><path fill="#0D401C" d="M22.386 18.026c-1.548-1.324-3.119-2.126-4.648-.804l-.913.799c-.668.58-1.91 3.29-6.712-2.234c-4.801-5.517-1.944-6.376-1.275-6.951l.918-.8c1.521-1.325.947-2.993-.15-4.71l-.662-1.04C7.842.573 6.642-.552 5.117.771l-.824.72c-.674.491-2.558 2.087-3.015 5.119c-.55 3.638 1.185 7.804 5.16 12.375c3.97 4.573 7.857 6.87 11.539 6.83c3.06-.033 4.908-1.675 5.486-2.272l.827-.721c1.521-1.322.576-2.668-.973-3.995l-.931-.801z" /></svg></span>
                        <span>+1 234 567 890</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-secondary rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="#0D401C" d="M17.25 2.75H6.75A4.75 4.75 0 0 0 2 7.5v9a4.75 4.75 0 0 0 4.75 4.75h10.5A4.76 4.76 0 0 0 22 16.5v-9a4.76 4.76 0 0 0-4.75-4.75m-3.65 8.32a3.26 3.26 0 0 1-3.23 0L3.52 7.14a3.25 3.25 0 0 1 3.23-2.89h10.5a3.26 3.26 0 0 1 3.23 2.89z" /></svg></span>          <span>info@example.com</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-secondary rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><path fill="#0D401C" d="M10 20S3 10.87 3 7a7 7 0 1 1 14 0c0 3.87-7 13-7 13zm0-11a2 2 0 1 0 0-4a2 2 0 0 0 0 4z" /></svg></span>          <span>123 Main St, City, Country</span>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4 bg-white/10 px-8 py-2 rounded-full">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>                </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17.318.077c1.218.056 2.06.235 2.838.537a5.36 5.36 0 0 1 1.956 1.274a5.36 5.36 0 0 1 1.274 1.956c.302.779.481 1.62.537 2.838C23.992 8.192 24 8.724 24 12s-.008 3.808-.077 5.318c-.056 1.218-.235 2.06-.537 2.839a5.36 5.36 0 0 1-1.274 1.955a5.359 5.359 0 0 1-1.956 1.274c-.779.302-1.62.481-2.838.537c-1.51.069-2.041.077-5.318.077c-3.277 0-3.809-.008-5.318-.077c-1.218-.056-2.06-.235-2.839-.537a5.359 5.359 0 0 1-1.955-1.274a5.36 5.36 0 0 1-1.274-1.956c-.302-.779-.481-1.62-.537-2.838C.008 15.81 0 15.278 0 12c0-3.277.008-3.81.077-5.318c.056-1.218.235-2.06.537-2.838a5.36 5.36 0 0 1 1.274-1.956A5.36 5.36 0 0 1 3.843.614C4.623.312 5.464.133 6.682.077C8.19.008 8.722 0 12 0c3.277 0 3.81.008 5.318.077ZM12 2.667c-3.24 0-3.736.007-5.197.074c-.927.042-1.483.16-1.994.359a2.73 2.73 0 0 0-1.036.673A2.707 2.707 0 0 0 3.1 4.809c-.198.51-.317 1.067-.359 1.994C2.674 8.264 2.667 8.76 2.667 12s.007 3.736.074 5.197c.042.927.16 1.483.359 1.993c.17.436.35.713.673 1.037c.324.324.601.504 1.036.673c.51.198 1.067.317 1.994.359c1.462.067 1.958.074 5.197.074c3.24 0 3.735-.007 5.197-.074c.927-.042 1.483-.16 1.994-.359a2.73 2.73 0 0 0 1.036-.673c.324-.324.504-.601.673-1.036c.198-.51.317-1.067.359-1.994c.067-1.462.074-1.958.074-5.197s-.007-3.735-.074-5.197c-.042-.927-.16-1.483-.359-1.993a2.709 2.709 0 0 0-.673-1.037A2.708 2.708 0 0 0 19.19 3.1c-.51-.198-1.067-.317-1.994-.359c-1.461-.067-1.957-.074-5.197-.074Zm0 15.555a6.222 6.222 0 1 1 0-12.444a6.222 6.222 0 0 1 0 12.444Zm0-2.666a3.556 3.556 0 1 0 0-7.112a3.556 3.556 0 0 0 0 7.112Zm6.222-8.445a1.333 1.333 0 1 1 0-2.667a1.333 1.333 0 0 1 0 2.667Z" /></svg>                </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-white/50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2m5.939 7.713v.646a.37.37 0 0 1-.38.37a5.364 5.364 0 0 1-2.903-1.108v4.728a3.938 3.938 0 0 1-1.18 2.81a4.011 4.011 0 0 1-2.87 1.17a4.103 4.103 0 0 1-2.862-1.17a3.98 3.98 0 0 1-1.026-3.805c.159-.642.48-1.232.933-1.713a3.58 3.58 0 0 1 2.79-1.313h.82v1.703a.348.348 0 0 1-.39.348a1.918 1.918 0 0 0-1.23 3.631c.27.155.572.246.882.267c.24.01.48-.02.708-.092a1.928 1.928 0 0 0 1.313-1.816V5.754a.359.359 0 0 1 .359-.36h1.415a.359.359 0 0 1 .359.34a3.303 3.303 0 0 0 1.282 2.245a3.25 3.25 0 0 0 1.641.636a.37.37 0 0 1 .338.35z" /></svg>                </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-white/50 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 840 790"><path fill="currentColor" d="M422 2q101 0 171 4t116 16t71 33t37 57t15 86t2 121l-2 121q-1 50-15 86t-37 56t-71 34t-116 16t-171 4t-171-4t-116-16t-71-34t-37-56t-14-86t-3-121t3-121t14-86t37-57t71-33T251 6t171-4zm132 331q12-6 12-14t-12-14l-185-86q-12-6-20-1t-9 20v162q0 14 9 19t20 0z" /></svg>                </a>
                </div>
            </div>
        </div>
    );
}