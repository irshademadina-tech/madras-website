import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { LiveRoom } from "@/components/live/live-room";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function LiveLessonPage({ params }: PageProps) {
  const { token } = await params;
  if (!/^[A-Za-z0-9]{6,40}$/.test(token)) notFound();

  const live = await db.liveSession.findUnique({
    where: { token },
    include: { lesson: { include: { student: true } } },
  });
  if (!live) notFound();

  const session = await getServerSession(authOptions);
  const role = session?.user?.role as string | undefined;
  const isTeacher = !!session?.user?.id && session.user.id === live.teacherUserId;
  const isAdmin = role === "ADMIN";

  const teacher = await db.user.findUnique({
    where: { id: live.teacherUserId },
    select: { name: true },
  });

  return (
    <LiveRoom
      token={live.token}
      title={live.title}
      teacherName={teacher?.name ?? "Teacher"}
      studentName={live.lesson?.student?.name ?? null}
      startAyah={live.startAyah ?? live.lesson?.startAyah ?? 1}
      endAyah={live.endAyah ?? live.lesson?.endAyah ?? 7}
      canManage={isTeacher || isAdmin}
      viewerName={
        isTeacher
          ? teacher?.name ?? "Teacher"
          : session?.user?.name ?? live.lesson?.student?.name ?? "Student"
      }
      signedIn={!!session}
    />
  );
}
