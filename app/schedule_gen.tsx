"use client";

import html2canvas from "html2canvas";
import { ScheduleData, Subject, TIME_SLOT, getSlotSpan } from "./types";

interface Props {
  scheduleData: ScheduleData;
  theme: string;
}

const THEMES = {
  default: {
    background: "#fff",
    color: "#000",
    headerBg: "#f0f0f0",
    headerText: "#000",
    subjectBg: "#e3f2fd",
    subjectBorder: "#2196f3",
    timeBg: "#f5f5f5",
    timeText: "#666",
  },
  dark: {
    background: "#1a1a1a",
    color: "#fff",
    headerBg: "#333",
    headerText: "#fff",
    subjectBg: "#1e3a8a",
    subjectBorder: "#3b82f6",
    timeBg: "#222",
    timeText: "#aaa",
  },
  blue: {
    background: "#1e3a8a",
    color: "#fff",
    headerBg: "#2563eb",
    headerText: "#fff",
    subjectBg: "#3b82f6",
    subjectBorder: "#1e40af",
    timeBg: "#1e40af",
    timeText: "#bfdbfe",
  },
} as const;

function getTimeSlots() {
  const slots: Array<{ start: string; end: string }> = [];
  for (let i = 0; i < TIME_SLOT.length; i += 2) {
    if (i + 1 < TIME_SLOT.length) {
      slots.push({
        start: TIME_SLOT[i],
        end: TIME_SLOT[i + 1],
      });
    }
  }
  return slots;
}

export default function FullSchedulePreview({ scheduleData, theme }: Props) {
  const currentTheme = THEMES[theme as keyof typeof THEMES] ?? THEMES.default;

  const SLOT_HEIGHT = 40;
  const HEADER_HEIGHT = 35;
  const TIME_COL_WIDTH = 70;
  const DAY_COL_WIDTH = 90;

  const timeSlots = getTimeSlots();

  const buildDaySubjects = (subjects: Subject[]) => {
    const grid: (Subject & { slotIndex: number; slotSpan: number })[] = [];
    let currentSlot = 0;

    subjects.forEach((subject) => {
      const slotSpan = getSlotSpan(subject.is_merge);
      grid.push({
        ...subject,
        slotIndex: currentSlot,
        slotSpan,
      });
      currentSlot += slotSpan;
    });

    return grid;
  };

  const maxSlots = Math.max(
    1,
    ...scheduleData.schedule.map((day) => {
      const daySubjects = buildDaySubjects(day.subjects);
      return Math.max(...daySubjects.map((s) => s.slotIndex + s.slotSpan), 1);
    }),
  );

  return (
    <div
      id="schedule-preview"
      style={{
        background: currentTheme.background,
        color: currentTheme.color,
        padding: "12px",
        fontFamily: "Arial, sans-serif",
        overflow: "auto",
        fontSize: "12px",
      }}
    >
      <h2 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
        Weekly Schedule - Student {scheduleData.student_id}
      </h2>

      <div style={{ display: "flex", gap: 0, position: "relative" }}>
        <div
          style={{
            position: "relative",
            width: `${TIME_COL_WIDTH}px`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: `${HEADER_HEIGHT}px`,
              background: currentTheme.timeBg,
              borderRight: `1px solid ${currentTheme.subjectBorder}`,
              borderBottom: `1px solid ${currentTheme.subjectBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "9px",
              boxSizing: "border-box",
            }}
          >
            Time
          </div>

          {Array.from({ length: maxSlots }).map((_, slotIndex) => {
            const slot = timeSlots[slotIndex];
            return (
              <div
                key={slotIndex}
                style={{
                  position: "absolute",
                  top: `${HEADER_HEIGHT + slotIndex * SLOT_HEIGHT}px`,
                  left: 0,
                  right: 0,
                  height: `${SLOT_HEIGHT}px`,
                  background: currentTheme.timeBg,
                  borderRight: `1px solid ${currentTheme.subjectBorder}`,
                  borderBottom: `1px solid ${currentTheme.subjectBorder}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "2px 3px",
                  boxSizing: "border-box",
                  fontSize: "7px",
                  fontWeight: "bold",
                  color: currentTheme.timeText,
                  textAlign: "center",
                  lineHeight: 1.1,
                  overflow: "hidden",
                }}
              >
                <div>{slot?.start ?? ""}</div>
                <div>{slot?.end ?? ""}</div>
              </div>
            );
          })}

          <div
            style={{
              height: `${maxSlots * SLOT_HEIGHT}px`,
              visibility: "hidden",
              pointerEvents: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          {scheduleData.schedule.map((day) => {
            const daySubjects = buildDaySubjects(day.subjects);

            return (
              <div
                key={day.day}
                style={{
                  width: `${DAY_COL_WIDTH}px`,
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: `${HEADER_HEIGHT}px`,
                    background: currentTheme.headerBg,
                    color: currentTheme.headerText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "10px",
                    textTransform: "capitalize",
                    borderRight: `1px solid ${currentTheme.subjectBorder}`,
                    borderBottom: `1px solid ${currentTheme.subjectBorder}`,
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  {day.day}
                </div>

                <div
                  style={{
                    position: "relative",
                    height: `${maxSlots * SLOT_HEIGHT}px`,
                    borderRight: `1px solid ${currentTheme.subjectBorder}`,
                    backgroundImage: `linear-gradient(to bottom, transparent 39px, ${currentTheme.subjectBorder}22 40px)`,
                    backgroundSize: `100% ${SLOT_HEIGHT}px`,
                  }}
                >
                  {daySubjects.map((subject, subjectIdx) => {
                    const top = subject.slotIndex * SLOT_HEIGHT;
                    const height = subject.slotSpan * SLOT_HEIGHT;

                    return (
                      <div
                        key={subjectIdx}
                        style={{
                          position: "absolute",
                          top: `${top}px`,
                          left: 0,
                          right: 0,
                          height: `${height}px`,
                          background: currentTheme.subjectBg,
                          border: `1px solid ${currentTheme.subjectBorder}`,
                          padding: "2px",
                          boxSizing: "border-box",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          fontSize: "7px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "bold",
                            lineHeight: 1.1,
                            marginBottom: "1px",
                          }}
                        >
                          {subject.name}
                        </div>

                        {subject.is_merge && (
                          <div
                            style={{
                              fontSize: "6px",
                              background: "rgba(255, 193, 7, 0.7)",
                              color: "#000",
                              padding: "0px 1px",
                              borderRadius: "2px",
                              display: "inline-block",
                              marginBottom: "1px",
                              width: "fit-content",
                            }}
                          >
                            2x
                          </div>
                        )}

                        {subject.teacher.length > 0 && (
                          <div
                            style={{
                              fontSize: "6px",
                              opacity: 0.7,
                              lineHeight: 1,
                              overflow: "hidden",
                            }}
                          >
                            {subject.teacher.slice(0, 1).map((t, idx) => (
                              <div key={idx}>{t}</div>
                            ))}
                            {subject.teacher.length > 1 && (
                              <div>+{subject.teacher.length - 1}</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export async function generateSchedule(
  scheduleData: ScheduleData,
  theme: string,
): Promise<string> {
  const element = document.getElementById("schedule-preview");
  if (!element) return "";

  await document.fonts?.ready;

  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    allowTaint: true,
    useCORS: true,
  });

  return canvas.toDataURL("image/png");
}
