import React from "react";
import { View, Text, Image } from "react-native";
// components/posters/IntroPoster.tsx (Etter fiks)
import UiText from "@/src/ui/UiText";
import PrimaryButton from "@/src/ui/PrimaryButton";

type Props = {
  children?: React.ReactNode;
  from?: string;
  to?: string;
  meters?: number | null;
  nextFrom?: string | null;
  nextTo?: string | null;
  nextMeters?: number | null;
  logoSource?: any;
  onStart?: () => void;
};

function IntroPoster({
  children,
  from,
  to,
  meters,
  nextFrom,
  nextTo,
  nextMeters,
  logoSource,
  onStart,
}: Props) {
  const hasMain = !!from && !!to && typeof meters === "number" && !Number.isNaN(meters as number);
  const hasNext = !!nextFrom && !!nextTo && typeof nextMeters === "number" && !Number.isNaN(nextMeters as number);

  const isPrim = (x: any) => typeof x === "string" || typeof x === "number";
  const renderedChildren = Array.isArray(children)
    ? children.map((ch, i) => (isPrim(ch) ? <UiText key={i} style={{ color: "white" }}>{ch as any}</UiText> : ch))
    : isPrim(children)
      ? <UiText style={{ color: "white" }}>{children as any}</UiText>
      : children ?? null;

  return (
    <View style={{ alignItems: "center", padding: 16 }}>
      {logoSource ? (
        <Image source={logoSource} style={{ width: 120, height: 120, marginBottom: 12 }} resizeMode="contain" />
      ) : null}

      {hasMain ? (
        <UiText style={{ color: "white", fontWeight: "800", fontSize: 18 }}>
          {from} → {to} ({Math.round(meters || 0)} m)
        </UiText>
      ) : null}

      {hasNext ? (
        <UiText style={{ color: "white", opacity: 0.9, marginTop: 6 }}>
          Neste: {nextFrom} → {nextTo} ({Math.round(nextMeters || 0)} m)
        </UiText>
      ) : null}

      {renderedChildren ? <View style={{ marginTop: hasMain || hasNext ? 8 : 0 }}>{renderedChildren}</View> : null}

      {onStart ? (
        <PrimaryButton
          onPress={onStart}
          android_ripple={{ color: "#334155" }}
          style={{ marginTop: 14, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#2563eb" }}
        >
          <UiText style={{ color: "white", fontWeight: "700" }}>Start spillet</UiText>
        </PrimaryButton>
      ) : null}
    </View>
  );
}

export default React.memo(IntroPoster);
