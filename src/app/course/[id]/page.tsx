"use client";

import { useParams } from 'next/navigation';
import CourseWorkspace from '@/components/CourseWorkspace';

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  return <CourseWorkspace courseId={id} />;
}
