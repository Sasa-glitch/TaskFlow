import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "../../utils/supabase";
import ThemeToggle from "./../ThemeToggle/ThemeToggle";
import TaskComponent from "../Task/Task";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "../Toast/ToastContext";

export interface Task {
    id: number;
    created_at: string;
    title: string;
    description: string;
    email: string;
    finished: boolean;
    image_url: string | null;
}

function TaskManager({ userSession }: { userSession: Session }) {
    console.log("this is the email", userSession.user.email);
    const [task, setTask] = useState({
        title: "",
        description: "",
        email: userSession.user.email,
        finished: false,
    });
    const [tasksList, setTasksList] = useState<Task[]>([]);
    const { showToast } = useToast();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

    // —— Clean up image preview to prevent memory leaks ──
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // —— Handle Adding Image ──
    const handleAddingImage = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
            console.log("this is the image file", file);
        }
    };

    // —— Handle Removing Selected Image ──
    const handleRemoveSelectedImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        const fileInput = document.getElementById("file") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    // —— Upload Image To Bucket ──
    const handleUploadImage = async (file: File): Promise<string | null> => {
        const pathName = `${userSession.user.email}-${Date.now()}-${file.name.split(".").pop()}`;
        console.log("this is path name", pathName);

        const { error } = await supabase.storage
            .from("images")
            .upload(pathName, file);
        if (error) {
            console.error("error happened during uploading the image", error);
            return null;
        }
        const publicUrl = supabase.storage
            .from("images")
            .getPublicUrl(pathName);
        return publicUrl.data.publicUrl;
    };
    // ── Add Task ──
    const handleAddingTask = async () => {
        // —— Uploading the image ——
        let image_url: null | string = null;
        if (imageFile) {
            image_url = await handleUploadImage(imageFile);
            console.log("this is the image url", image_url);
        }
        if (!task.title.trim()) return;
        setIsAddingTask(true);
        const { error } = await supabase
            .from("tasks")
            .insert({ ...task, image_url })
            .single();
        if (error) {
            console.error("Error adding task:", error);
            showToast(error.message, "error");
        } else {
            setTask({
                title: "",
                description: "",
                email: userSession.user.email,
                finished: false,
            });
            setImageFile(null);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
                setImagePreview(null);
            }
            const fileInput = document.getElementById(
                "file",
            ) as HTMLInputElement;
            if (fileInput) {
                fileInput.value = "";
            }
            showToast("Task added successfully!", "success");
        }
        setIsAddingTask(false);
    };

    // ── Delete Task ──
    const deletingTask = async (id: number, url: string | null) => {
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (url) {
            handleDeleteImage(url);
        }
        if (error) {
            console.error("Couldn't delete task:", error);
            showToast(error.message, "error");
        } else {
            // setTasksList((prev) => prev.filter((t) => t.id !== id));
            showToast("Task deleted successfully", "success");
        }
    };

    // —— Delete Picture
    const handleDeleteImage = async (url: string) => {
        const path = url.split("/public/images/")[1];
        const { error, data } = await supabase.storage
            .from("images")
            .remove([path]);
        if (error) {
            console.error("Couldn't delete an Image:", error);
            showToast(error.message, "error");
        } else {
            // setTasksList((prev) => prev.filter((t) => t.id !== id));
            console.log("deleting image data", data);
            showToast("Image deleted successfully", "success");
        }
    };

    // ── Update Task ──
    const handleUpdateTask = async (
        id: number,
        title: string,
        description: string,
        newImageUrl?: string | null,
    ) => {
        const updatePayload: Record<string, unknown> = { title, description };
        if (newImageUrl !== undefined) updatePayload.image_url = newImageUrl;

        const { error } = await supabase
            .from("tasks")
            .update(updatePayload)
            .eq("id", id);
        if (error) {
            showToast(error.message, "error");
        } else {
            showToast("Task updated successfully!", "success");
        }
    };

    // ── Finish Task ──
    const handleFinishTask = async (id: number, isFinished: boolean) => {
        console.log("I run");
        const { error } = await supabase
            .from("tasks")
            .update({ finished: !isFinished })
            .eq("id", id);
        if (error) {
            console.error("Error updating task:", error);
            showToast(error.message, "error");
        } else {
            showToast(
                !isFinished
                    ? "Task marked as completed! 🎉"
                    : "Task marked as incomplete",
                "success",
            );
            // fetchTasks();
            console.log("finished toggle success");
        }
    };

    // ── Fetch Tasks ──
    const fetchTasks = async () => {
        const { error, data } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: true });
        if (error) {
            console.error("Error fetching tasks:", error);
        } else {
            setTasksList(data);
            console.log("this is the data", data);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // —— Broadcasting useEffect ——
    useEffect(() => {
        const channel = supabase.channel("Insert-channel");
        channel
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "tasks" },
                (payload) => {
                    const newTask = payload.new as Task;
                    setTasksList((prev) => [...prev, newTask]);
                },
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "tasks" },
                (payload) => {
                    const updatedTask = payload.new as Task;
                    setTasksList((prev) =>
                        prev.map((task) =>
                            task.id === updatedTask.id ? updatedTask : task,
                        ),
                    );
                },
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "tasks" },
                (payload) => {
                    const removedTaskId = payload.old.id;
                    console.log("this is the removed task id", removedTaskId);
                    setTasksList((prev) =>
                        prev.filter((task) => task.id !== removedTaskId),
                    );
                },
            )
            .subscribe((status) => {
                console.log("this is the status", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="page-container">
            {/* ── Theme Toggle (separate component) ── */}
            <ThemeToggle />

            <div className="content-wrapper">
                {/* ── Header ── */}
                <header className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <h1
                            className="text-4xl font-extrabold tracking-tight"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Task
                            <span style={{ color: "var(--color-accent)" }}>
                                Flow
                            </span>
                        </h1>
                    </div>
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Organize your work. Stay on track. Get things done.
                    </p>
                </header>

                {/* ── Add Task Form ── */}
                <div className={`card mb-8 animate-fade-in ${isAddingTask ?? " blur-sm"}`}>
                    <div className="card-body">
                        <form
                            id="add-task-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAddingTask();
                            }}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="title"
                                            className="input-label"
                                        >
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            className="input-field"
                                            placeholder="What needs to be done?"
                                            value={task.title}
                                            onChange={(e) =>
                                                setTask((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="description"
                                            className="input-label"
                                        >
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            id="description"
                                            className="input-field"
                                            placeholder="Add some details…"
                                            value={task.description}
                                            onChange={(e) =>
                                                setTask((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <span className="input-label">
                                        Task Image (Optional)
                                    </span>
                                    {imagePreview ? (
                                        <div className="relative group rounded-lg overflow-hidden border border-(--color-border) max-w-sm aspect-video bg-(--color-surface-elevated)">
                                            <img
                                                src={imagePreview}
                                                className="w-full h-full object-cover"
                                                alt="Upload Preview"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRemoveSelectedImage
                                                    }
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 cursor-pointer shadow-md"
                                                    title="Remove image"
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="file"
                                            className="border-2 border-dashed border-(--color-border) hover:border-(--color-border-focus) rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-(--color-surface-elevated) hover:bg-(--color-surface-card) transition-all duration-200 group"
                                        >
                                            <input
                                                type="file"
                                                id="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAddingImage}
                                            />
                                            <svg
                                                className="w-6 h-6 text-(--color-text-secondary) group-hover:text-(--color-accent) transition-colors duration-200"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="18"
                                                    height="18"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <circle
                                                    cx="8.5"
                                                    cy="8.5"
                                                    r="1.5"
                                                />
                                                <polyline points="21 15 16 10 5 21" />
                                            </svg>
                                            <span className="text-xs font-semibold text-(--color-text-secondary) group-hover:text-(--color-text-primary) transition-colors duration-200">
                                                Click to upload task image
                                            </span>
                                            <span className="text-[10px] text-(--color-text-muted)">
                                                PNG, JPG, GIF up to 5MB
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <button
                                id="add-task-btn"
                                type="submit"
                                className="btn-primary self-end"
                                disabled={!task.title.trim() || isAddingTask}
                            >
                                {isAddingTask ? (
                                    <>
                                        <svg
                                            className="animate-spin"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line
                                                x1="12"
                                                y1="5"
                                                x2="12"
                                                y2="19"
                                            />
                                            <line
                                                x1="5"
                                                y1="12"
                                                x2="19"
                                                y2="12"
                                            />
                                        </svg>
                                        Add Task
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Tasks Header ── */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="section-heading">Your Tasks</h2>
                    <span className="badge">{tasksList.length}</span>
                </div>

                {/* ── Tasks List ── */}
                {tasksList.length === 0 ? (
                    <div className="empty-state">
                        <span className="text-5xl mb-4">📋</span>
                        <p className="text-sm font-medium">No tasks yet</p>
                        <p className="text-xs mt-1">
                            Add your first task above to get started!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {tasksList.map((t, index) => (
                            <TaskComponent
                                key={t.id}
                                task={t}
                                index={index}
                                onDelete={deletingTask}
                                onUpdate={handleUpdateTask}
                                onFinish={handleFinishTask}
                                deleteImage={handleDeleteImage}
                                uploadImage={handleUploadImage}
                            />
                        ))}
                    </div>
                )}

                {/* ── Footer ── */}
                <footer className="mt-12 mb-4 text-center">
                    <p
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                    >
                        Built with React & Supabase
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default TaskManager;
