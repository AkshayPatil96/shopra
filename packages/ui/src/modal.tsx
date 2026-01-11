"use client";

import { CSSProperties, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

const overlayStyle: CSSProperties = {
	position: "fixed",
	inset: 0,
	backgroundColor: "rgba(0,0,0,0.4)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	zIndex: 1000,
};

const dialogStyle: CSSProperties = {
	width: "min(90vw, 520px)",
	maxHeight: "90vh",
	backgroundColor: "#ffffff",
	borderRadius: "12px",
	boxShadow: "0 20px 60px rgba(15,23,42,0.15)",
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
};

const sectionStyle: CSSProperties = {
	padding: "1.5rem",
};

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

const sizeToWidth: Record<Exclude<ModalSize, "full">, string> = {
	xs: "min(90vw, 320px)",
	sm: "min(90vw, 420px)",
	md: "min(90vw, 520px)",
	lg: "min(92vw, 640px)",
	xl: "min(94vw, 860px)",
};

interface ModalProps {
	/** Controls whether the modal is visible */
	isOpen: boolean;
	/** Called when the user requests to close the modal */
	onClose?: () => void;
	/** Header node (title, actions, etc.) */
	header?: ReactNode;
	/** Body/content node */
	body?: ReactNode;
	/** Footer node (buttons, links, etc.) */
	footer?: ReactNode;
	/** Provide aria-label for accessibility when header is absent */
	ariaLabel?: string;
	/** Hides the X button when false */
	showCloseButton?: boolean;
	/** When true (default) clicking the overlay closes the modal */
	closeOnOverlay?: boolean;
	/** Enable Escape key close (default true) */
	closeOnEsc?: boolean;
	/** Optional custom class applied to the overlay */
	overlayClassName?: string;
	/** Optional custom class applied to the dialog */
	dialogClassName?: string;
	/** Controls dialog width */
	size?: ModalSize;
}

export function Modal({
	isOpen,
	onClose,
	header,
	body,
	footer,
	ariaLabel,
	showCloseButton = true,
	closeOnOverlay = true,
	closeOnEsc = true,
	overlayClassName,
	dialogClassName,
	size = "md",
}: ModalProps) {
	useEffect(() => {
		if (!isOpen || !closeOnEsc) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, closeOnEsc, onClose]);

	if (!isOpen || typeof document === "undefined") {
		return null;
	}

	const appliedWidth = size === "full" ? "100vw" : sizeToWidth[size];

	const content = (
		<div
			style={overlayStyle}
			className={overlayClassName}
			onMouseDown={(event) => {
				if (event.target === event.currentTarget && closeOnOverlay) {
					onClose?.();
				}
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel}
				style={{
					...dialogStyle,
					width: appliedWidth,
					maxWidth: size === "full" ? "100vw" : undefined,
				}}
				className={dialogClassName}
			>
				{(header || showCloseButton) && (
					<div style={{ ...sectionStyle, borderBottom: "1px solid #f0f0f0" }}>
						<div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
							<div style={{ flex: 1 }}>{header}</div>
							{showCloseButton && (
								<button
									onClick={onClose}
									aria-label="Close"
									style={{
										border: "none",
										background: "transparent",
										cursor: "pointer",
										fontSize: "1.25rem",
										lineHeight: 1,
									}}
								>
									×
								</button>
							)}
						</div>
					</div>
				)}

				{body && (
					<div style={{ ...sectionStyle, flex: 1, overflowY: "auto" }}>{body}</div>
				)}

				{footer && (
					<div style={{ ...sectionStyle, borderTop: "1px solid #f0f0f0" }}>{footer}</div>
				)}
			</div>
		</div>
	);

	return createPortal(content, document.body);
}
