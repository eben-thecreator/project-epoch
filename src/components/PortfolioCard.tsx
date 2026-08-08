import React from "react";
import { motion } from "framer-motion";
import { mediaUrl } from "../lib/api";

type PortfolioCardProps = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  mediaType: string;
  category?: string | null;
  year?: string | null;
  tags?: string[];
  onClick?: () => void;
};

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  title,
  description,
  imageUrl,
  mediaType,
  category,
  year,
  tags = [],
  onClick,
}) => {
  const hasMetadata = category || year || tags.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      className="group cursor-pointer bg-[#f5f5f5] rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Header Section - Title & Description on grey background */}
      <div className="p-5 pb-4">
        <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1.5 line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Image Section */}
      <div className="relative aspect-[16/10] bg-gray-200 mx-4 rounded-lg overflow-hidden">
        {mediaType === "image" && imageUrl ? (
          <img
            src={mediaUrl(imageUrl)}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              3D Model
            </span>
          </div>
        )}
      </div>

      {/* Metadata Section - Non-empty fields below image */}
      {hasMetadata && (
        <div className="p-5 pt-4 flex flex-wrap items-center gap-2">
          {category && (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
              {category}
            </span>
          )}
          {year && (
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
              {year}
            </span>
          )}
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};
