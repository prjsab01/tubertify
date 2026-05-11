export async function generateStaticParams() {
  return [];
}

export default function CoursePage() {
  return <CoursePageClientWrapper />;
}

// Dynamically import to avoid SSR issues with Firebase client SDK
import dynamic from "next/dynamic";
const CoursePageClientWrapper = dynamic(() => import("./CoursePageClient"), { ssr: false });
