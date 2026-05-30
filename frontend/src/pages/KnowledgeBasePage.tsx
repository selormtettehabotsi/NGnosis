import { useParams } from "react-router-dom";
import KnowledgeBase from "../components/knowledge-base/KnowledgeBase";
import CourseDetail from "../components/knowledge-base/CourseDetail";

export default function KnowledgeBasePage() {
  const { courseId } = useParams();
  return courseId ? <CourseDetail courseId={Number(courseId)} /> : <KnowledgeBase />;
}
