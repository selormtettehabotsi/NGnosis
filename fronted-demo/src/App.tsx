import { useMemo, useRef, useState, type FormEvent } from "react";
import useSWR from "swr";
import {
  Archive,
  BarChart3,
  BookOpenText,
  Bot,
  Clock3,
  FileText,
  FolderArchive,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type View = "courses" | "archive" | "generated";

type Course = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  updatedAt: string;
};

type ArchiveDocument = {
  id: string;
  title: string;
  courseId: string;
  type: string;
  uploadedAt: string;
};

type GeneratedContent = {
  id: string;
  title: string;
  courseId: string;
  kind: "Quiz" | "Summary" | "Flashcards";
  generatedAt: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const initialCourses: Course[] = [
  {
    id: "c-1",
    title: "Neural Signal Processing",
    level: "Advanced",
    description: "Signal pipelines, denoising strategies, and analysis workflows.",
    updatedAt: "Apr 1, 2026",
  },
  {
    id: "c-2",
    title: "Applied Research Writing",
    level: "Intermediate",
    description: "Building publishable papers with structured argumentation.",
    updatedAt: "Mar 27, 2026",
  },
  {
    id: "c-3",
    title: "Foundations of Data Literacy",
    level: "Beginner",
    description: "Core data terms, interpretation, and communication essentials.",
    updatedAt: "Mar 22, 2026",
  },
];

const initialDocuments: ArchiveDocument[] = [
  {
    id: "d-1",
    title: "Week 4 EEG Lab Notes.pdf",
    courseId: "c-1",
    type: "PDF",
    uploadedAt: "Apr 1, 2026",
  },
  {
    id: "d-2",
    title: "Signal Features Matrix.csv",
    courseId: "c-1",
    type: "CSV",
    uploadedAt: "Mar 30, 2026",
  },
  {
    id: "d-3",
    title: "Proposal Rubric.docx",
    courseId: "c-2",
    type: "DOCX",
    uploadedAt: "Mar 29, 2026",
  },
  {
    id: "d-4",
    title: "Dataset Glossary.csv",
    courseId: "c-3",
    type: "CSV",
    uploadedAt: "Mar 24, 2026",
  },
];

const initialGenerated: GeneratedContent[] = [
  {
    id: "g-1",
    title: "Chapter 3 Concept Summary",
    courseId: "c-3",
    kind: "Summary",
    generatedAt: "Apr 2, 2026",
  },
  {
    id: "g-2",
    title: "Signal Filtering Quiz - Set A",
    courseId: "c-1",
    kind: "Quiz",
    generatedAt: "Apr 1, 2026",
  },
  {
    id: "g-3",
    title: "Research Terms Flashcards",
    courseId: "c-2",
    kind: "Flashcards",
    generatedAt: "Mar 30, 2026",
  },
];

const fetchCourses = async () => {
  await wait(220);
  return initialCourses;
};

const fetchDocuments = async () => {
  await wait(260);
  return initialDocuments;
};

const fetchGenerated = async () => {
  await wait(290);
  return initialGenerated;
};

function App() {
  const [view, setView] = useState<View>("courses");
  const [selectedCourseId, setSelectedCourseId] = useState("c-1");
  const [createOpen, setCreateOpen] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState("");
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLevel, setNewLevel] = useState<Course["level"]>("Beginner");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: courses = [], mutate: mutateCourses } = useSWR("courses", fetchCourses, {
    revalidateOnFocus: false,
  });
  const { data: documents = [], mutate: mutateDocuments } = useSWR("documents", fetchDocuments, {
    revalidateOnFocus: false,
  });
  const { data: generated = [] } = useSWR("generated", fetchGenerated, {
    revalidateOnFocus: false,
  });

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  const courseDocuments = useMemo(
    () => documents.filter((doc) => doc.courseId === selectedCourseId),
    [documents, selectedCourseId]
  );

  const courseGenerated = useMemo(
    () => generated.filter((item) => item.courseId === selectedCourseId),
    [generated, selectedCourseId]
  );

  const filteredArchive = useMemo(() => {
    const q = archiveQuery.trim().toLowerCase();
    if (!q) return courseDocuments;
    return courseDocuments.filter((doc) => `${doc.title} ${doc.type}`.toLowerCase().includes(q));
  }, [archiveQuery, courseDocuments]);

  const filteredGenerated = useMemo(() => {
    const q = generatedQuery.trim().toLowerCase();
    if (!q) return courseGenerated;
    return courseGenerated.filter((item) => `${item.title} ${item.kind}`.toLowerCase().includes(q));
  }, [generatedQuery, courseGenerated]);

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      setNotice("Course title is required.");
      return;
    }

    const created: Course = {
      id: `c-${crypto.randomUUID()}`,
      title: newTitle.trim(),
      level: newLevel,
      description: newDescription.trim() || "No description yet.",
      updatedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    await mutateCourses((current = []) => [created, ...current], false);

    setSelectedCourseId(created.id);
    setView("courses");
    setCreateOpen(false);
    setNewTitle("");
    setNewDescription("");
    setNewLevel("Beginner");
    setNotice(`Created ${created.title}. Opened for document uploads.`);
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || !selectedCourse) return;

    const names = Array.from(files).map((file) => file.name);
    setUploadQueue(names);

    const now = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newDocs: ArchiveDocument[] = names.map((name) => {
      const ext = name.includes(".") ? name.split(".").pop()!.toUpperCase() : "FILE";
      return {
        id: `d-${crypto.randomUUID()}`,
        title: name,
        courseId: selectedCourse.id,
        type: ext,
        uploadedAt: now,
      };
    });

    await mutateDocuments((current = []) => [...newDocs, ...current], false);
    setNotice(`Uploaded ${newDocs.length} document(s) to ${selectedCourse.title}.`);
  };

  return (
    <div className="mx-auto grid min-h-full w-full max-w-[1450px] grid-cols-1 gap-5 p-4 lg:grid-cols-[320px_1fr] lg:p-6">
      <Card className="h-fit rounded-2xl border-white/60 bg-white/75 backdrop-blur lg:sticky lg:top-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Neurognosis Studio</CardTitle>
              <CardDescription>Per-course workspace</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create course
          </Button>

          <div className="space-y-2">
            <Button
              variant={view === "courses" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setView("courses")}
            >
              <BookOpenText className="h-4 w-4" />
              Course Browser
            </Button>
            <Button
              variant={view === "archive" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setView("archive")}
            >
              <Archive className="h-4 w-4" />
              Archive Browser
            </Button>
            <Button
              variant={view === "generated" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setView("generated")}
            >
              <Bot className="h-4 w-4" />
              Generated Content
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Courses</p>
            <div className="max-h-[260px] space-y-2 overflow-auto pr-1">
              {courses.map((course) => {
                const isActive = course.id === selectedCourseId;
                return (
                  <Button
                    key={course.id}
                    variant={isActive ? "secondary" : "outline"}
                    className="h-auto w-full justify-start py-3"
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    <div className="text-left">
                      <p className="line-clamp-1 text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.level}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-background p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Storage</p>
            <p className="mt-2 text-sm font-medium">6.3 GB used of 20 GB</p>
            <Progress value={32} className="mt-3" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Total Courses" value={String(courses.length)} icon={GraduationCap} />
          <MetricCard title="Selected Docs" value={String(courseDocuments.length)} icon={FolderArchive} />
          <MetricCard title="Generated Assets" value={String(courseGenerated.length)} icon={Sparkles} />
          <MetricCard title="Model Activity" value="Active" icon={BarChart3} />
        </div>

        {notice ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 text-sm text-primary">{notice}</CardContent>
          </Card>
        ) : null}

        {view === "courses" ? (
          <CoursesView
            courses={courses}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            selectedCourse={selectedCourse}
            courseDocuments={courseDocuments}
            uploadQueue={uploadQueue}
            fileInputRef={fileInputRef}
            onUpload={handleUploadFiles}
          />
        ) : null}

        {view === "archive" ? (
          <ArchiveView
            selectedCourse={selectedCourse}
            archiveQuery={archiveQuery}
            setArchiveQuery={setArchiveQuery}
            documents={filteredArchive}
          />
        ) : null}

        {view === "generated" ? (
          <GeneratedView
            selectedCourse={selectedCourse}
            generatedQuery={generatedQuery}
            setGeneratedQuery={setGeneratedQuery}
            items={filteredGenerated}
          />
        ) : null}
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Create Course</CardTitle>
              <CardDescription>
                New courses start empty. Open the course to upload documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateCourse}>
                <div className="space-y-2">
                  <Label htmlFor="new-course-title">Course title</Label>
                  <Input
                    id="new-course-title"
                    placeholder="e.g. Cognitive Neuroscience 101"
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Level</Label>
                  <div className="flex gap-2">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={newLevel === level ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setNewLevel(level)}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-course-description">Description</Label>
                  <Textarea
                    id="new-course-description"
                    placeholder="Short summary and learning goals"
                    value={newDescription}
                    onChange={(event) => setNewDescription(event.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create and open</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

type CoursesViewProps = {
  courses: Course[];
  selectedCourseId: string;
  setSelectedCourseId: (courseId: string) => void;
  selectedCourse: Course | null;
  courseDocuments: ArchiveDocument[];
  uploadQueue: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (files: FileList | null) => Promise<void>;
};

function CoursesView({
  courses,
  selectedCourseId,
  setSelectedCourseId,
  selectedCourse,
  courseDocuments,
  uploadQueue,
  fileInputRef,
  onUpload,
}: CoursesViewProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Course Browser</CardTitle>
          <CardDescription>Open a course to manage documents and model outputs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <Button
              key={course.id}
              variant={selectedCourseId === course.id ? "secondary" : "outline"}
              className="h-auto justify-start p-4"
              onClick={() => setSelectedCourseId(course.id)}
            >
              <div className="space-y-2 text-left">
                <p className="line-clamp-1 text-sm font-semibold">{course.title}</p>
                <Badge variant="outline">{course.level}</Badge>
                <p className="line-clamp-2 text-xs text-muted-foreground">{course.description}</p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedCourse ? selectedCourse.title : "No course selected"}</CardTitle>
          <CardDescription>
            {selectedCourse
              ? `Upload documents to ${selectedCourse.title}.`
              : "Select a course from the browser."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => onUpload(event.target.files)}
          />

          <Button
            variant="outline"
            className="h-auto w-full justify-start rounded-xl border-dashed border-primary/40 bg-primary/5 p-6 text-left hover:bg-primary/10"
            disabled={!selectedCourse}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-start gap-3">
              <UploadCloud className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Upload into selected course</p>
                <p className="text-sm text-muted-foreground">PDF, DOCX, TXT, CSV, MD • repeat anytime</p>
              </div>
            </div>
          </Button>

          <div className="space-y-3">
            {(uploadQueue.length ? uploadQueue : ["No uploads queued yet"]).map((name, index) => (
              <div key={`${name}-${index}`} className="rounded-lg border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="truncate">{name}</span>
                  <Badge variant="outline">{uploadQueue.length ? "Uploaded" : "Idle"}</Badge>
                </div>
                <Progress value={uploadQueue.length ? 100 : 0} />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Recent documents in this course</p>
            {courseDocuments.slice(0, 4).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                <p className="truncate text-sm">{doc.title}</p>
                <Badge variant="secondary">{doc.type}</Badge>
              </div>
            ))}
            {!courseDocuments.length ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No documents yet.
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ArchiveViewProps = {
  selectedCourse: Course | null;
  archiveQuery: string;
  setArchiveQuery: (value: string) => void;
  documents: ArchiveDocument[];
};

function ArchiveView({ selectedCourse, archiveQuery, setArchiveQuery, documents }: ArchiveViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archive Browser</CardTitle>
        <CardDescription>
          {selectedCourse
            ? `Showing archive for ${selectedCourse.title}.`
            : "Select a course to view its archive."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search files in selected course"
            value={archiveQuery}
            onChange={(event) => setArchiveQuery(event.target.value)}
            disabled={!selectedCourse}
          />
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="shadow-none">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <p className="min-w-0 truncate text-sm font-medium">{doc.title}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{doc.type}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock3 className="h-3 w-3" />
                    {doc.uploadedAt}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}

          {!documents.length ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No archive entries for this course.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

type GeneratedViewProps = {
  selectedCourse: Course | null;
  generatedQuery: string;
  setGeneratedQuery: (value: string) => void;
  items: GeneratedContent[];
};

function GeneratedView({ selectedCourse, generatedQuery, setGeneratedQuery, items }: GeneratedViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
        <CardDescription>
          {selectedCourse
            ? `Showing generated assets for ${selectedCourse.title}.`
            : "Select a course to view generated assets."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search generated assets in selected course"
            value={generatedQuery}
            onChange={(event) => setGeneratedQuery(event.target.value)}
            disabled={!selectedCourse}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>{item.kind}</CardDescription>
              </CardHeader>
              <CardFooter className="justify-between pt-0">
                <Badge variant="outline" className="gap-1">
                  <Clock3 className="h-3 w-3" />
                  {item.generatedAt}
                </Badge>
                <Button size="sm" variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!items.length ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No generated content for this course.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
  return (
    <Card className="rounded-xl border-white/60 bg-white/80">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default App;
