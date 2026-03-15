// Home page — maps to the "/" route
import PhotoLoop from "@/components/photoLoop";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-6 py-10">

      {/* Photos displayed at the top of the landing page */}
      <div className="w-full max-w-3xl">
        <PhotoLoop />
      </div>

      {/* TODO: Access code input form */}
    </main>
  );
}
