"use client";

import { useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  ThumbsDown,
  Pin,
  Heart,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Star,
  Send,
  Loader2,
  MapPin,
  Package,
  Sparkles,
  Trash2,
  MessageCircle,
} from "lucide-react";
import type { CustomerReviewData } from "@/lib/reviews";
import {
  parseReviewReplies,
  toHandle,
  type ReviewReplyItem,
} from "@/lib/review-replies";
import {
  submitCustomerReviewAction,
  toggleReviewLikeAction,
  submitReviewReplyAction,
  deleteReviewReplyAction,
  toggleReviewPinAction,
  deleteReviewAction,
} from "@/app/(store)/testimonios/actions";

interface CustomerReviewsSectionProps {
  initialReviews: CustomerReviewData[];
  userSession?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

// Genera un color consistente basado en el nombre para el avatar estilo YouTube
function getAvatarColor(name: string) {
  const colors = [
    "bg-emerald-600 text-white",
    "bg-amber-600 text-white",
    "bg-sky-600 text-white",
    "bg-indigo-600 text-white",
    "bg-rose-600 text-white",
    "bg-purple-600 text-white",
    "bg-teal-600 text-white",
    "bg-[#b0894f] text-[#0a0a0a]",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Formatea fecha al estilo relativo de YouTube ("hace 2 horas", "hace 3 días")
function formatYouTubeTime(date: Date | string) {
  try {
    const d = new Date(date);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "hace un momento";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `hace ${diffWeeks} ${diffWeeks === 1 ? "semana" : "semanas"}`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `hace ${diffMonths} ${diffMonths === 1 ? "mes" : "meses"}`;
    const diffYears = Math.floor(diffDays / 365);
    return `hace ${diffYears} ${diffYears === 1 ? "año" : "años"}`;
  } catch {
    return "hace un momento";
  }
}

// Avatar pequeño para respuestas dentro del hilo
function ReplyAvatar({ reply }: { reply: ReviewReplyItem }) {
  if (reply.isOfficial) {
    return (
      <div className="h-7 w-7 rounded-full bg-[#0a0a0a] border border-[#c9a15a] flex items-center justify-center text-[#c9a15a] font-bold text-xs shadow">
        M
      </div>
    );
  }
  return (
    <div
      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs select-none shadow-sm ${getAvatarColor(
        reply.authorName,
      )}`}
    >
      {reply.authorName.charAt(0).toUpperCase()}
    </div>
  );
}

export function CustomerReviewsSection({
  initialReviews,
  userSession,
}: CustomerReviewsSectionProps) {
  const [reviews, setReviews] = useState<CustomerReviewData[]>(initialReviews);
  const [sortBy, setSortBy] = useState<"top" | "newest">("top");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const isStaffUser =
    userSession?.role === "ADMIN" || userSession?.role === "VENDEDOR";
  const isAdminUser = userSession?.role === "ADMIN";

  // Estado del cuadro de comentario principal estilo YouTube
  const [isFocused, setIsFocused] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState(userSession?.name || "");
  const [customerEmail, setCustomerEmail] = useState(userSession?.email || "");
  const [city, setCity] = useState("Santo Domingo");
  const [orderNumber, setOrderNumber] = useState("");
  const [productName, setProductName] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();

  // Estados de Likes por ID de comentario
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [dislikedReviews, setDislikedReviews] = useState<Record<string, boolean>>({});
  const [reviewLikesCount, setReviewLikesCount] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const r of initialReviews) {
      map[r.id] = r.likes || 0;
    }
    return map;
  });

  // Hilos de respuestas abiertas (acordeón estilo YouTube)
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({
    // La primera que tenga respuesta se muestra abierta
    [initialReviews.find((r) => r.officialReply)?.id || ""]: true,
  });

  // Caja de respuesta activa (comentario + @handle al que se responde)
  const [activeReply, setActiveReply] = useState<{ reviewId: string; handle: string } | null>(
    null,
  );
  const [replyInputText, setReplyInputText] = useState("");
  const [replyName, setReplyName] = useState(userSession?.name || "");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSubmittingReply, startReplyTransition] = useTransition();

  // Hilos de respuestas parseados por comentario (compatibles con texto plano antiguo)
  const repliesByReview = useMemo(() => {
    const map: Record<string, ReviewReplyItem[]> = {};
    for (const r of reviews) {
      map[r.id] = parseReviewReplies(r.officialReply, r.officialReplyAt ?? r.createdAt);
    }
    return map;
  }, [reviews]);

  function openReplyBox(reviewId: string, authorName: string) {
    const handle = toHandle(authorName);
    if (activeReply?.reviewId === reviewId && activeReply.handle === handle) {
      setActiveReply(null);
      return;
    }
    setActiveReply({ reviewId, handle });
    setReplyInputText("");
    setReplyError(null);
  }

  // Comentarios ordenados
  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (sortBy === "top") {
      return list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const likesA = reviewLikesCount[a.id] ?? a.likes;
        const likesB = reviewLikesCount[b.id] ?? b.likes;
        return likesB - likesA;
      });
    } else {
      return list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
  }, [reviews, sortBy, reviewLikesCount]);

  // Manejar el envío de un nuevo comentario en tiempo real
  function handlePostComment() {
    setFormError(null);
    if (!commentText.trim() || commentText.trim().length < 8) {
      setFormError("Escribe al menos 8 caracteres sobre tu experiencia.");
      return;
    }

    const finalName = customerName.trim() || userSession?.name || "Cliente Mudeco";

    const formData = new FormData();
    formData.set("customerName", finalName);
    formData.set("customerEmail", customerEmail.trim());
    formData.set("comment", commentText.trim());
    formData.set("rating", String(rating));
    formData.set("city", city.trim() || "República Dominicana");
    if (productName.trim()) formData.set("productName", productName.trim());
    if (orderNumber.trim()) formData.set("orderNumber", orderNumber.trim());

    startSubmitTransition(async () => {
      const res = await submitCustomerReviewAction(formData);
      if (res.success) {
        const tempId = res.id || `yt-${Date.now()}`;
        const newReview: CustomerReviewData = {
          id: tempId,
          customerName: finalName,
          customerEmail: customerEmail.trim() || null,
          rating,
          comment: commentText.trim(),
          city: city.trim() || "República Dominicana",
          productName: productName.trim() || null,
          orderNumber: orderNumber.trim() || null,
          isVerified: Boolean(orderNumber.trim()),
          likes: 1, // El creador le da like inicial
          dislikes: 0,
          isPinned: false,
          officialReply: null,
          officialReplyAt: null,
          status: "APPROVED",
          createdAt: new Date(),
        };

        setReviews((prev) => [newReview, ...prev]);
        setReviewLikesCount((prev) => ({ ...prev, [tempId]: 1 }));
        setLikedReviews((prev) => ({ ...prev, [tempId]: true }));

        // Limpiar estado
        setCommentText("");
        setIsFocused(false);
        setFormError(null);
      } else {
        setFormError(res.error || "No se pudo publicar el comentario. Inténtalo de nuevo.");
      }
    });
  }

  // Manejar Like en tiempo real estilo YouTube
  function handleToggleLike(reviewId: string) {
    const isLiked = likedReviews[reviewId];
    const currentLikes = reviewLikesCount[reviewId] ?? 0;

    if (isLiked) {
      // Quitar like
      setLikedReviews((prev) => ({ ...prev, [reviewId]: false }));
      setReviewLikesCount((prev) => ({
        ...prev,
        [reviewId]: Math.max(0, currentLikes - 1),
      }));
      toggleReviewLikeAction(reviewId, -1);
    } else {
      // Dar like (y quitar dislike si existía)
      setLikedReviews((prev) => ({ ...prev, [reviewId]: true }));
      setDislikedReviews((prev) => ({ ...prev, [reviewId]: false }));
      setReviewLikesCount((prev) => ({
        ...prev,
        [reviewId]: currentLikes + 1,
      }));
      toggleReviewLikeAction(reviewId, 1);
    }
  }

  // Manejar Dislike estilo YouTube
  function handleToggleDislike(reviewId: string) {
    const isDisliked = dislikedReviews[reviewId];
    const isLiked = likedReviews[reviewId];
    const currentLikes = reviewLikesCount[reviewId] ?? 0;

    if (isDisliked) {
      setDislikedReviews((prev) => ({ ...prev, [reviewId]: false }));
    } else {
      setDislikedReviews((prev) => ({ ...prev, [reviewId]: true }));
      if (isLiked) {
        setLikedReviews((prev) => ({ ...prev, [reviewId]: false }));
        setReviewLikesCount((prev) => ({
          ...prev,
          [reviewId]: Math.max(0, currentLikes - 1),
        }));
        toggleReviewLikeAction(reviewId, -1);
      }
    }
  }

  // Responder a un comentario o a una respuesta estilo YouTube (todos los usuarios)
  function handleSendReply(reviewId: string) {
    const text = replyInputText.trim();
    if (!text) return;
    setReplyError(null);

    if (!isStaffUser && !userSession?.name && replyName.trim().length < 2) {
      setReplyError("Escribe tu nombre para poder responder.");
      return;
    }

    const handle = activeReply?.reviewId === reviewId ? activeReply.handle : null;

    startReplyTransition(async () => {
      const res = await submitReviewReplyAction(reviewId, text, {
        authorName: replyName.trim(),
        replyToHandle: handle,
      });
      if (res.success && res.replies) {
        const replies = res.replies;
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  officialReply: JSON.stringify(replies),
                  officialReplyAt: new Date(),
                }
              : r,
          ),
        );
        setExpandedReplies((prev) => ({ ...prev, [reviewId]: true }));
        setActiveReply(null);
        setReplyInputText("");
      } else {
        setReplyError(res.error || "No se pudo publicar la respuesta.");
      }
    });
  }

  function handleDeleteReply(reviewId: string, replyId: string) {
    startReplyTransition(async () => {
      const res = await deleteReviewReplyAction(reviewId, replyId);
      if (res.success && res.replies) {
        const replies = res.replies;
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, officialReply: replies.length ? JSON.stringify(replies) : null }
              : r,
          ),
        );
      }
    });
  }

  function handleTogglePin(reviewId: string) {
    if (reviewId.startsWith("yt-")) return;
    startReplyTransition(async () => {
      const res = await toggleReviewPinAction(reviewId);
      if (res.success && typeof res.isPinned === "boolean") {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, isPinned: res.isPinned! } : r,
          ),
        );
      }
    });
  }

  function handleDeleteReview(reviewId: string) {
    if (reviewId.startsWith("yt-")) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      return;
    }
    startReplyTransition(async () => {
      const res = await deleteReviewAction(reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    });
  }

  const currentUserInitial = userSession?.name
    ? userSession.name.charAt(0).toUpperCase()
    : "T";

  return (
    <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-8 lg:px-12">
      {/* —— Cabecera estilo barra superior de YouTube —— */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {reviews.length} Comentarios
            </h2>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              En tiempo real
            </span>
          </div>

          {/* Menú de ordenamiento estilo YouTube */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/[0.08] transition"
            >
              <SlidersHorizontal className="h-4 w-4 text-stone-400" />
              <span>
                Ordenar por:{" "}
                <span className="text-white font-bold">
                  {sortBy === "top" ? "Mejores comentarios" : "Más recientes"}
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
            </button>

            {isSortMenuOpen && (
              <div className="absolute left-0 mt-2 z-30 w-52 rounded-xl border border-white/10 bg-[#1f1f1f] py-1.5 shadow-2xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("top");
                    setIsSortMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition flex items-center justify-between ${
                    sortBy === "top"
                      ? "bg-white/10 text-[#c9a15a] font-bold"
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>Mejores comentarios</span>
                  {sortBy === "top" && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("newest");
                    setIsSortMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition flex items-center justify-between ${
                    sortBy === "newest"
                      ? "bg-white/10 text-[#c9a15a] font-bold"
                      : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>Más recientes</span>
                  {sortBy === "newest" && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-stone-400">
          <Sparkles className="h-3.5 w-3.5 text-[#c9a15a]" />
          <span>Experiencias y testimonios de compradores reales de Mudeco Palets</span>
        </div>
      </div>

      {/* —— Caja de Agregar Comentario (Exacto estilo YouTube) —— */}
      <div className="flex items-start gap-3 sm:gap-4 mb-10 pb-8 border-b border-white/[0.08]">
        {/* Avatar del usuario que va a comentar */}
        <div className="shrink-0">
          <div
            className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base select-none shadow-sm ${
              userSession?.name
                ? getAvatarColor(userSession.name)
                : "bg-gradient-to-tr from-[#c9a15a] to-[#e4c284] text-[#0a0a0a]"
            }`}
          >
            {currentUserInitial}
          </div>
        </div>

        {/* Input / Área de texto expansible estilo YouTube */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <textarea
              rows={isFocused ? 3 : 1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Agrega un comentario sobre tu experiencia con Mudeco Palets..."
              className="w-full resize-none bg-transparent text-sm sm:text-base text-white placeholder-stone-400 outline-none transition-all duration-200 border-b border-stone-700 focus:border-white pb-2 leading-relaxed"
            />
          </div>

          {/* Opciones y Controles cuando está enfocado */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-3 space-y-3"
              >
                {/* Selector de calificación con estrellas interactivas */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/[0.03] p-2.5 border border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-300">Calificación:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= (hoverRating || rating)
                                ? "fill-[#c9a15a] text-[#c9a15a]"
                                : "fill-stone-700 text-stone-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#c9a15a] ml-1">
                      {hoverRating || rating}.0
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Se publicará al instante en tiempo real</span>
                  </div>
                </div>

                {/* Campos de Nombre, Correo, Ciudad y Mueble comprado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre (ej. Brayan Camacho)"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-stone-400 outline-none focus:border-[#c9a15a]"
                  />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Tu correo (opcional)"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-stone-400 outline-none focus:border-[#c9a15a]"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Tu ciudad (ej. Santo Domingo)"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-stone-400 outline-none focus:border-[#c9a15a]"
                  />
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Pieza adquirida (opcional)"
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-stone-400 outline-none focus:border-[#c9a15a]"
                  />
                </div>

                {/* Si compró con orden, para verificar compra */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Número de pedido opcional (ej: WEB-2026-00007 para insignia de compra verificada)"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-stone-400 outline-none focus:border-[#c9a15a]"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-rose-400 font-medium">{formError}</p>
                )}

                {/* Barra de botones estilo YouTube (Cancelar y Comentar) */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFocused(false);
                      setCommentText("");
                      setFormError(null);
                    }}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-stone-300 hover:bg-white/10 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={!commentText.trim() || isSubmitting}
                    onClick={handlePostComment}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-xs font-bold hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        <span>Comentar</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* —— Lista de Comentarios Estilo YouTube —— */}
      <div className="space-y-6">
        {sortedReviews.map((review) => {
          const isLiked = likedReviews[review.id];
          const isDisliked = dislikedReviews[review.id];
          const likesCount = reviewLikesCount[review.id] ?? review.likes ?? 0;
          const replies = repliesByReview[review.id] || [];
          const hasReplies = replies.length > 0;
          const isRepliesOpen = expandedReplies[review.id];
          const isReplying = activeReply?.reviewId === review.id;

          return (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 sm:gap-4 text-sm"
            >
              {/* Avatar circular estilo YouTube */}
              <div className="shrink-0 pt-0.5">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm select-none shadow-sm ${getAvatarColor(
                    review.customerName,
                  )}`}
                >
                  {review.customerName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Cuerpo del comentario estilo YouTube */}
              <div className="flex-1 min-w-0">
                {/* Comentario Fijado por Mudeco Palets si aplica */}
                {review.isPinned && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-300 mb-1">
                    <Pin className="h-3.5 w-3.5 text-[#c9a15a] fill-[#c9a15a]" />
                    <span>Fijado por Mudeco Palets</span>
                  </div>
                )}

                {/* Línea superior: Handle / Nombre, Insignias y Timestamp */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-white text-xs sm:text-sm hover:underline cursor-pointer">
                    {toHandle(review.customerName)}
                  </span>

                  <span className="text-xs text-stone-400 font-normal">
                    {review.customerName}
                  </span>

                  {/* Insignia de Compra Verificada estilo YouTube Channel Badge */}
                  {review.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded bg-[#c9a15a]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#c9a15a] border border-[#c9a15a]/30">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Compra verificada</span>
                    </span>
                  )}

                  {/* Ciudad */}
                  {review.city && (
                    <span className="text-[11px] text-stone-300 flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5 text-stone-400" />
                      {review.city}
                    </span>
                  )}

                  <span className="text-xs text-stone-400">·</span>

                  <span className="text-xs text-stone-400">
                    {formatYouTubeTime(review.createdAt)}
                  </span>
                </div>

                {/* Estrellas y Mueble adquirido */}
                <div className="flex items-center gap-2 mt-1 mb-1.5">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? "fill-[#c9a15a] text-[#c9a15a]"
                            : "fill-stone-700 text-stone-700"
                        }`}
                      />
                    ))}
                  </div>

                  {review.productName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-200/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      <Package className="h-3 w-3 text-[#c9a15a]" />
                      <span className="truncate max-w-[260px]">{review.productName}</span>
                    </span>
                  )}
                </div>

                {/* Texto del comentario */}
                <p className="text-sm leading-relaxed text-stone-100 whitespace-pre-line break-words mt-1">
                  {review.comment}
                </p>

                {/* Barra de Herramientas de YouTube: Likes, Dislikes, Corazón del Creador y Moderación */}
                <div className="flex flex-wrap items-center gap-1 mt-2.5 text-xs text-stone-300">
                  {/* Botón Like */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(review.id)}
                    aria-label="Me gusta"
                    className={`inline-flex items-center gap-1.5 rounded-full p-1.5 pr-2.5 transition active:scale-90 ${
                      isLiked
                        ? "text-[#c9a15a] font-bold bg-[#c9a15a]/10"
                        : "hover:bg-white/10 text-stone-300"
                    }`}
                  >
                    <ThumbsUp
                      className={`h-3.5 w-3.5 ${isLiked ? "fill-[#c9a15a]" : ""}`}
                    />
                    <span>{likesCount > 0 ? likesCount : ""}</span>
                  </button>

                  {/* Botón Dislike */}
                  <button
                    type="button"
                    onClick={() => handleToggleDislike(review.id)}
                    aria-label="No me gusta"
                    className={`rounded-full p-1.5 transition active:scale-90 ${
                      isDisliked
                        ? "text-rose-400 bg-rose-500/10"
                        : "hover:bg-white/10 text-stone-300"
                    }`}
                  >
                    <ThumbsDown
                      className={`h-3.5 w-3.5 ${isDisliked ? "fill-rose-400" : ""}`}
                    />
                  </button>

                  {/* Corazón del creador Mudeco Palets estilo YouTube */}
                  <div
                    title="A Mudeco Palets le gustó este comentario"
                    className="relative flex items-center justify-center pl-1 pr-2 group cursor-default"
                  >
                    <div className="h-4 w-4 rounded-full bg-[#c9a15a] text-[#0a0a0a] flex items-center justify-center font-black text-[9px] shadow-sm">
                      M
                    </div>
                    <Heart className="h-3 w-3 text-red-500 fill-red-500 -ml-1.5 drop-shadow" />
                  </div>

                  {/* Responder a @usuario (visible para todos) */}
                  <button
                    type="button"
                    onClick={() => openReplyBox(review.id, review.customerName)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold transition ${
                      isReplying && activeReply?.handle === toHandle(review.customerName)
                        ? "bg-white/10 text-white"
                        : "text-stone-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Responder</span>
                  </button>

                  {isAdminUser && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTogglePin(review.id)}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-[#c9a15a] hover:bg-[#c9a15a]/10 transition"
                        title={review.isPinned ? "Desfijar comentario" : "Fijar comentario"}
                      >
                        <Pin className="h-3 w-3" />
                        <span>{review.isPinned ? "Desfijar" : "Fijar"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                        title="Eliminar comentario"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Eliminar</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Caja de respuesta activa estilo YouTube */}
                <AnimatePresence>
                  {isReplying && activeReply && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex items-start gap-3">
                        <div
                          className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                            isStaffUser
                              ? "bg-[#0a0a0a] border border-[#c9a15a] text-[#c9a15a]"
                              : userSession?.name
                                ? getAvatarColor(userSession.name)
                                : "bg-gradient-to-tr from-[#c9a15a] to-[#e4c284] text-[#0a0a0a]"
                          }`}
                        >
                          {isStaffUser ? "M" : currentUserInitial}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-400">
                            <span>Respondiendo a</span>
                            <span className="font-semibold text-[#c9a15a]">{activeReply.handle}</span>
                            {isStaffUser && (
                              <span className="rounded bg-[#c9a15a] text-[#0a0a0a] px-1 text-[9px] font-black uppercase tracking-wider">
                                Como Taller Oficial
                              </span>
                            )}
                          </div>
                          {!isStaffUser && !userSession?.name && (
                            <input
                              type="text"
                              value={replyName}
                              maxLength={60}
                              onChange={(e) => setReplyName(e.target.value)}
                              placeholder="Tu nombre"
                              className="w-full sm:w-64 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white placeholder-stone-400 outline-none focus:border-[#c9a15a]"
                            />
                          )}
                          <textarea
                            rows={2}
                            autoFocus
                            maxLength={600}
                            value={replyInputText}
                            onChange={(e) => setReplyInputText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                handleSendReply(review.id);
                              }
                            }}
                            placeholder={`Responder a ${activeReply.handle}...`}
                            className="w-full resize-none bg-transparent text-xs sm:text-sm text-white placeholder-stone-400 outline-none border-b border-stone-700 focus:border-white pb-1.5 leading-relaxed"
                          />
                          {replyError && (
                            <p className="text-[11px] text-rose-400 font-medium">{replyError}</p>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReply(null);
                                setReplyError(null);
                              }}
                              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-white/10 transition"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={!replyInputText.trim() || isSubmittingReply}
                              onClick={() => handleSendReply(review.id)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-xs font-bold hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              {isSubmittingReply ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              <span>{isSubmittingReply ? "Enviando..." : "Responder"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hilo de respuestas oficiales estilo YouTube (Acordeón ▼ 1 respuesta) */}
                {hasReplies && (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedReplies((prev) => ({
                          ...prev,
                          [review.id]: !prev[review.id],
                        }))
                      }
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-[#c9a15a] hover:bg-[#c9a15a]/10 transition"
                    >
                      {isRepliesOpen ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          <span>{replies.length === 1 ? "Ocultar respuesta" : "Ocultar respuestas"}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          <span>
                            {replies.length} {replies.length === 1 ? "respuesta" : "respuestas"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Contenido de la respuesta desplegada estilo YouTube */}
                    <AnimatePresence>
                      {isRepliesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden mt-2.5 ml-2 pl-3 border-l-2 border-[#c9a15a]/30 space-y-4"
                        >
                          {replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className="shrink-0">
                                <ReplyAvatar reply={reply} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-xs text-white">
                                    {reply.isOfficial ? "Mudeco Palets" : toHandle(reply.authorName)}
                                  </span>
                                  {reply.isOfficial ? (
                                    <span className="rounded bg-[#c9a15a] text-[#0a0a0a] px-1 text-[9px] font-black uppercase tracking-wider">
                                      Taller Oficial ✔
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-stone-400">
                                      {reply.authorName}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-stone-400">
                                    · {formatYouTubeTime(reply.createdAt)}
                                  </span>
                                </div>

                                <p className="text-xs text-stone-200 mt-1 leading-relaxed whitespace-pre-line break-words">
                                  {reply.replyToHandle && (
                                    <span className="font-semibold text-[#c9a15a] mr-1">
                                      {reply.replyToHandle}
                                    </span>
                                  )}
                                  {reply.text}
                                </p>

                                <div className="flex items-center gap-1 mt-1 text-[11px] text-stone-400">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openReplyBox(
                                        review.id,
                                        reply.isOfficial ? "Mudeco Palets" : reply.authorName,
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-stone-300 hover:bg-white/10 hover:text-white transition"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    <span>
                                      Responder a{" "}
                                      {reply.isOfficial ? "@mudeco_palets" : toHandle(reply.authorName)}
                                    </span>
                                  </button>
                                  {isAdminUser && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReply(review.id, reply.id)}
                                      className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                                      title="Eliminar respuesta"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
