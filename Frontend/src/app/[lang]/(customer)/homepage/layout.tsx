import { Navigation } from "@/components";

const HomepageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="max-w-screen min-h-screen overflow-hidden">
            <Navigation />
            {children}
        </div>
    );
}

export default HomepageLayout;