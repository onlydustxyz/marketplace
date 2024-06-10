import { LazyMotion, Variants, domAnimation, motion, useAnimation } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { useIsClient } from "usehooks-ts";

import { ActivityAnimationState } from "app/home/features/activity/activity.hooks";
import { ActivityViewerItem } from "app/home/features/activity/components/activity-viewer-item/activity-viewer-item";

import { TActivityViewerItem } from "./activity-viewer-item.types";

export function ActivityViewerItemAnimation({ data, index }: TActivityViewerItem.Props) {
  const { state } = data;
  const isClientOnly = useIsClient();
  const controls = useAnimation();
  const delay = useMemo(() => index * 0.1, [index]);
  const transition = useMemo(
    () => ({
      type: "spring",
      stiffness: 100,
    }),
    [delay]
  );
  const storedIndex = useRef(index);

  useEffect(() => {
    controls.set(ActivityAnimationState.Hidden);
  }, [isClientOnly]);

  useEffect(() => {
    if (index !== storedIndex.current) {
      controls.start({
        scale: 0.97,
        transition,
      });
      if (state !== ActivityAnimationState.Exit) {
        setTimeout(() => {
          controls.start(animate[ActivityAnimationState.Enter]);
          storedIndex.current = index;
        }, 300);
      }
    }
  }, [index, state]);

  useEffect(() => {
    setTimeout(() => {
      controls.start(state);
    }, 100);
  }, [state]);

  const animate: Variants = {
    [ActivityAnimationState.Hidden]: () => ({
      opacity: 0,
      y: -20,
      scale: 1.1,
      transition: {
        delay,
        ...transition,
      },
    }),
    [ActivityAnimationState.Exit]: () => ({
      opacity: 0,
      y: 10,
      scale: 0.9,
      transition: {
        delay: 0.1,
        ...transition,
      },
    }),
    [ActivityAnimationState.Enter]: () => ({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        delay,
        ...transition,
      },
    }),
  };

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        variants={animate}
        animate={controls}
        transition={{ type: "spring", stiffness: 100 }}
        initial={ActivityAnimationState.Hidden}
        exit={ActivityAnimationState.Exit}
      >
        <ActivityViewerItem data={data} index={index} />
      </motion.div>
    </LazyMotion>
  );
}