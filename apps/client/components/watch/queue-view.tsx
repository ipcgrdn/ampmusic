"use client";

import { usePlayerStore } from "@/lib/store/player-store";
import type { Track, RecommendedTrack } from "@/lib/store/player-store.types";
import {
  IconGripVertical,
  IconPlayerPlay,
  IconPlayerPause,
  IconX,
  IconPlaylistX,
  IconPlaylistAdd,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, formatDuration, getImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTrackRecommendations } from "@/hooks/use-track-recommendations";

interface SortableTrackItemProps {
  track: Track;
  index: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  toggle: () => void;
  play: (track: Track) => void;
  removeFromQueue: (index: number) => void;
}

function SortableTrackItem({
  track,
  index,
  currentTrack,
  isPlaying,
  toggle,
  play,
  removeFromQueue,
}: SortableTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-4 p-3 hover:bg-white/5 transition-all",
        isCurrentTrack && "bg-gradient-to-r from-purple-500/20 to-transparent",
        isDragging && "opacity-50"
      )}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab">
        <IconGripVertical className="w-4 h-4 text-white/40" />
      </div>

      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/5">
        <Image
          src={getImageUrl(track.album?.coverImage || "")}
          alt={track.title}
          fill
          className="object-cover"
        />
        <button
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "bg-black/40 backdrop-blur-sm transition-opacity",
            isCurrentTrack && isPlaying
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          )}
          onClick={() => (isCurrentTrack ? toggle() : play(track))}
        >
          {isCurrentTrack && isPlaying ? (
            <IconPlayerPause className="w-5 h-5" />
          ) : (
            <IconPlayerPlay className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCurrentTrack ? "text-purple-400" : "text-white/90"
          )}
        >
          {track.title}
        </p>
        <p className="text-sm text-white/40 truncate block">
          {track.artist?.name}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-white/40">
          {formatDuration(track.duration)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-all text-white/60 hover:text-red-400 hover:bg-red-400/10"
          onClick={() => removeFromQueue(index)}
        >
          <IconX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface SortableRecommendedTrackItemProps {
  track: RecommendedTrack;
  index: number;
  addToQueue: (track: Track) => void;
  onRemove: (index: number) => void;
  onPlay: (track: Track) => void;
}

function SortableRecommendedTrackItem({ track, index, addToQueue, onRemove, onPlay }: SortableRecommendedTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: track.recommendationId
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const handlePlay = () => onPlay({
    ...track,
    id: track.id,
    title: track.title,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-2 rounded-lg",
        "hover:bg-white/5 transition-all",
        isDragging && "opacity-50"
      )}
      {...attributes}
    >
      <div
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing"
      >
        <IconGripVertical className="w-4 h-4 text-white/20 group-hover:text-white/40" />
      </div>
      <div className="relative">
        <Image
          src={getImageUrl(track.album?.coverImage || "")}
          alt={track.title}
          width={40}
          height={40}
          className="rounded-md"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-white hover:scale-105 transition-transform"
            onClick={handlePlay}
          >
            <IconPlayerPlay className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{track.title}</p>
        <p className="text-xs text-white/60 truncate">{track.artist?.name}</p>
      </div>
      <div className="text-xs text-white/40">
        {formatDuration(track.duration)}
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/40 hover:text-white"
          onClick={() => addToQueue(track)}
        >
          <IconPlaylistAdd className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/40 hover:text-red-400"
          onClick={() => onRemove(index)}
        >
          <IconX className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function QueueView() {
  const {
    queue,
    currentTrack,
    isPlaying,
    toggle,
    removeFromQueue,
    reorderQueue,
    recommendedTracks,
    addRecommendedToQueue,
    clearQueue,
    play,
    removeFromRecommendations: removeRecommendedTrack,
    reorderRecommendations: reorderRecommendedTracks,
    addToQueue,
  } = usePlayerStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { isLoading: isLoadingRecommendations } = useTrackRecommendations();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = queue.findIndex((track) => track.id === active.id);
    const newIndex = queue.findIndex((track) => track.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderQueue(oldIndex, newIndex);
    }
  };

  const handleTrackPlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      toggle();
    } else {
      const trackIndex = queue.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        play(track, queue);
      }
    }
  };

  const handleRecommendedDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = recommendedTracks.findIndex((track) => track.recommendationId === active.id);
    const newIndex = recommendedTracks.findIndex((track) => track.recommendationId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderRecommendedTracks(oldIndex, newIndex);
    }
  };

  const handleRecommendedTrackPlay = (selectedTrack: Track) => {
    const newQueue = [...queue, selectedTrack];
    
    play(selectedTrack, newQueue);
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-4 border-b border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            다음 트랙 ({queue.length})
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full",
              "text-white/40 hover:text-red-400",
              "hover:bg-red-400/10",
              "transition-all duration-300"
            )}
            onClick={clearQueue}
          >
            <IconPlaylistX className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <div className="p-2">
            <SortableContext
              items={queue.map((track) => track.id)}
              strategy={verticalListSortingStrategy}
            >
              {queue.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SortableTrackItem
                    track={track as Track}
                    index={index}
                    currentTrack={currentTrack as Track | null}
                    isPlaying={isPlaying}
                    toggle={toggle}
                    play={handleTrackPlay}
                    removeFromQueue={removeFromQueue}
                  />
                </motion.div>
              ))}
            </SortableContext>
          </div>

          {recommendedTracks.length > 0 && (
            <div className="mt-4 p-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-sm font-medium text-white/60">
                  추천 트랙 ({recommendedTracks.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRecommendedToQueue}
                  className="text-xs text-white/60 hover:text-white"
                >
                  모두 추가
                </Button>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleRecommendedDragEnd}
              >
                <div className="space-y-1">
                  <SortableContext
                    items={recommendedTracks.map((track) => track.recommendationId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {recommendedTracks.map((track, index) => (
                      <motion.div
                        key={track.recommendationId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SortableRecommendedTrackItem
                          track={track as RecommendedTrack}
                          index={index}
                          addToQueue={addToQueue}
                          onRemove={removeRecommendedTrack}
                          onPlay={handleRecommendedTrackPlay}
                        />
                      </motion.div>
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            </div>
          )}

          {isLoadingRecommendations && (
            <div className="p-4 text-center text-white/40">
              <IconLoader2 className="w-5 h-5 animate-spin mx-auto" />
              <p className="text-xs mt-2">추천 트랙 로딩 중...</p>
            </div>
          )}
        </div>
      </DndContext>
    </motion.div>
  );
}
