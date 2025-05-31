import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiShare2,
  FiCopy,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiX,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaReddit,
  FaTelegramPlane,
  FaPinterest,
  FaTumblr,
  FaSkype,
  FaViber,
  FaLine,
  FaWeibo,
  FaVk,
  FaDigg,
  FaBuffer,
  FaFlipboard,
  FaSlack,
  FaInstagram,
  FaSnapchatGhost,
  FaDiscord,
  FaFacebookMessenger,
  FaMedium,
  FaGithub,
  FaYoutube,
  FaTwitch,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";

const platformColors = {
  Facebook: "#1877F2",
  Twitter: "#1DA1F2",
  LinkedIn: "#0077B5",
  WhatsApp: "#25D366",
  Reddit: "#FF4500",
  Telegram: "#0088CC",
  Pinterest: "#BD081C",
  Tumblr: "#34526f",
  Email: "#7a7a7a",
  Skype: "#00AFF0",
  Viber: "#665CAC",
  Line: "#00C300",
  Weibo: "#E6162D",
  VK: "#4C75A3",
  Digg: "#000000",
  Buffer: "#168EEA",
  Flipboard: "#E12828",
  Slack: "#4A154B",
  Instagram: "#E4405F",
  Snapchat: "#FFFC00",
  Discord: "#5865F2",
  "Facebook Messenger": "#0084FF",
  Medium: "#00AB6C",
  GitHub: "#000000",
  YouTube: "#FF0000",
  Twitch: "#6441A5",
  "Copy Link": "#6B7280",
};

const platforms = [
  {
    name: "Facebook",
    url: (link) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    icon: <FiFacebook size={20} />,
  },
  {
    name: "Twitter",
    url: (link) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`,
    icon: <FiTwitter size={20} />,
  },
  {
    name: "LinkedIn",
    url: (link) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(link)}`,
    icon: <FiLinkedin size={20} />,
  },
  {
    name: "WhatsApp",
    url: (link) => `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`,
    icon: <FaWhatsapp size={20} />,
  },
  {
    name: "Reddit",
    url: (link) => `https://www.reddit.com/submit?url=${encodeURIComponent(link)}`,
    icon: <FaReddit size={20} />,
  },
  {
    name: "Telegram",
    url: (link) => `https://t.me/share/url?url=${encodeURIComponent(link)}`,
    icon: <FaTelegramPlane size={20} />,
  },
  {
    name: "Pinterest",
    url: (link) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}`,
    icon: <FaPinterest size={20} />,
  },
  {
    name: "Tumblr",
    url: (link) =>
      `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(link)}`,
    icon: <FaTumblr size={20} />,
  },
  {
    name: "Email",
    url: (link) => `mailto:?subject=Check this out&body=${encodeURIComponent(link)}`,
    icon: <FiMail size={20} />,
  },
  {
    name: "Skype",
    url: (link) => `https://web.skype.com/share?url=${encodeURIComponent(link)}`,
    icon: <FaSkype size={20} />,
  },
  {
    name: "Viber",
    url: (link) => `viber://forward?text=${encodeURIComponent(link)}`,
    icon: <FaViber size={20} />,
  },
  {
    name: "Line",
    url: (link) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(link)}`,
    icon: <FaLine size={20} />,
  },
  {
    name: "Weibo",
    url: (link) => `http://service.weibo.com/share/share.php?url=${encodeURIComponent(link)}`,
    icon: <FaWeibo size={20} />,
  },
  {
    name: "VK",
    url: (link) => `https://vk.com/share.php?url=${encodeURIComponent(link)}`,
    icon: <FaVk size={20} />,
  },
  {
    name: "Digg",
    url: (link) => `https://digg.com/submit?url=${encodeURIComponent(link)}`,
    icon: <FaDigg size={20} />,
  },
  {
    name: "Buffer",
    url: (link) => `https://buffer.com/add?url=${encodeURIComponent(link)}`,
    icon: <FaBuffer size={20} />,
  },
  {
    name: "Flipboard",
    url: (link) =>
      `https://share.flipboard.com/bookmarklet/popout?v=2&url=${encodeURIComponent(link)}`,
    icon: <FaFlipboard size={20} />,
  },
  {
    name: "Slack",
    url: (link) => `https://slack.com/share?url=${encodeURIComponent(link)}`,
    icon: <FaSlack size={20} />,
  },
  {
    name: "Instagram",
    url: (link) => `https://www.instagram.com/?url=${encodeURIComponent(link)}`,
    icon: <FaInstagram size={20} />,
  },
  {
    name: "Snapchat",
    url: (link) => `https://snapchat.com/scan?link=${encodeURIComponent(link)}`,
    icon: <FaSnapchatGhost size={20} />,
  },
  {
    name: "Discord",
    url: (link) => `https://discord.com/channels/@me?url=${encodeURIComponent(link)}`,
    icon: <FaDiscord size={20} />,
  },
  {
    name: "Facebook Messenger",
    url: (link) => `fb-messenger://share/?link=${encodeURIComponent(link)}`,
    icon: <FaFacebookMessenger size={20} />,
  },
  {
    name: "Medium",
    url: (link) => `https://medium.com/p/import?url=${encodeURIComponent(link)}`,
    icon: <FaMedium size={20} />,
  },
  {
    name: "GitHub",
    url: (link) => `https://github.com/search?q=${encodeURIComponent(link)}`,
    icon: <FaGithub size={20} />,
  },
  {
    name: "YouTube",
    url: (link) => `https://www.youtube.com/share?url=${encodeURIComponent(link)}`,
    icon: <FaYoutube size={20} />,
  },
  {
    name: "Twitch",
    url: (link) => `https://www.twitch.tv/share?url=${encodeURIComponent(link)}`,
    icon: <FaTwitch size={20} />,
  },
  {
    name: "Copy Link",
    url: null,
    icon: <FiCopy size={20} />,
  },
];

const ProductActions = ({
  isWishlisted,
  toggleWishlists,
  totalWish,
  totalSold,
  totalReviews,
  productId,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const navigate = useNavigate();
  const shareRef = useRef(null);
  const currentUrl = window.location.href;

  const debouncedToggle = useCallback(
    debounce(() => toggleWishlists(), 300),
    [toggleWishlists]
  );

  const menuVariants = {
    open: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: { 
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlatformClick = (platform) => {
    if (platform.name === "Copy Link") {
      navigator.clipboard?.writeText(currentUrl)
        .then(() => toast.success("✨ Link copied to clipboard!"))
        .catch(() => toast.error("❌ Failed to copy link"));
    } else if (platform.url) {
      window.open(platform.url(currentUrl), "_blank", "noopener,noreferrer");
    }
    setShowShareMenu(false);
  };

  const handleBuyNow = () => {
    productId ? navigate(`/checkout/${productId}`) : toast.error("⚠️ Product ID missing");
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-full relative">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={debouncedToggle}
          className={`flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-lg font-semibold transition-all 
            ${isWishlisted 
              ? "border-orange-500/20 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:bg-orange-900/30 dark:text-orange-300"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"} 
            shadow-sm hover:shadow-md min-w-0`}
        >
          <FiHeart
            size={22}
            className={`shrink-0 ${isWishlisted ? "fill-orange-600 dark:fill-orange-300" : ""}`}
          />
          <span className="truncate">{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBuyNow}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 px-6 py-4 
                    text-lg font-semibold text-white shadow-lg hover:shadow-orange-500/30 transition-all 
                    hover:from-orange-600 hover:to-amber-600 dark:from-orange-600 dark:to-amber-600 
                    dark:hover:from-orange-700 dark:hover:to-amber-700 min-w-0"
        >
          🚀 Buy Now
        </motion.button>

        <div className="relative" ref={shareRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 
                      text-lg font-semibold text-gray-700 hover:bg-gray-50 w-full shadow-sm hover:shadow-md
                      dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 min-w-0"
          >
            <FiShare2 size={22} className="shrink-0" />
            <span className="truncate">Share</span>
          </motion.button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="absolute z-30 top-full mt-2 right-0 w-[95vw] sm:w-96 bg-white dark:bg-gray-800 
                          rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-4 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Share via</h3>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <FiX size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[70vh] overflow-y-auto">
                  {platforms.map((platform) => (
                    <motion.button
                      key={platform.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlatformClick(platform)}
                      className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl 
                                transition-colors duration-150 group relative"
                      title={platform.name}
                    >
                      <div 
                        className="p-0 rounded-full bg-gray-100 dark:bg-gray-900/50 mb-2 transition-colors"
                        style={{ backgroundColor: `${platformColors[platform.name]}10` }}
                      >
                        {React.cloneElement(platform.icon, {
                          size: 20,
                          className: "text-[color:var(--platform-color)]",
                          style: { '--platform-color': platformColors[platform.name] }
                        })}
                      </div>
                      <span 
                        className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full px-1"
                        style={{ color: platformColors[platform.name] }}
                      >
                        {platform.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center sm:flex sm:gap-6 sm:px-1">
        <StatItem value={totalWish} label="Wish" icon="❤️" />
        <StatItem value={totalSold} label="Sold" icon="🛒" />
        <StatItem value={totalReviews} label="Reviews" icon="⭐" />
      </div>
    </div>
  );
};

const StatItem = React.memo(({ value, label, icon }) => (
  <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2 text-gray-600 dark:text-gray-400">
    <span className="text-xl sm:text-2xl">{icon}</span>
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
      <span className="font-bold text-gray-900 dark:text-gray-200 text-lg sm:text-xl">
        {value || 0}
      </span>
      <span className="text-sm sm:text-base">{label}</span>
    </div>
  </div>
));

export default React.memo(ProductActions);