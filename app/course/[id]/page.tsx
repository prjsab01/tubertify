import dynamic from "next/dynamic";

const CoursePageClientWrapper = dynamic(() => import("./CoursePageClient"), { ssr: false });

export async function generateStaticParams() {
  return [];
}

export default function CoursePage() {
  return <CoursePageClientWrapper />;
}
