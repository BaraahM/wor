'use client';

import * as React from 'react';

import type { PlateElementProps } from '@udecode/plate/react';

import { PlateElement } from '@udecode/plate/react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import './heading-highlight.css';

const headingVariants = cva('relative mb-1', {
  variants: {
    variant: {
      h1: 'mt-[1.6em] pb-1 font-heading text-4xl font-bold',
      h2: 'mt-[1.4em] pb-px font-heading text-2xl font-semibold tracking-tight',
      h3: 'mt-[1em] pb-px font-heading text-xl font-semibold tracking-tight',
      h4: 'mt-[0.75em] font-heading text-lg font-semibold tracking-tight',
      h5: 'mt-[0.75em] text-lg font-semibold tracking-tight',
      h6: 'mt-[0.75em] text-base font-semibold tracking-tight',
    },
  },
});

interface HeadingElementProps extends PlateElementProps, VariantProps<typeof headingVariants> {
  highlighted?: boolean;
}

export function HeadingElement({
  highlighted = false,
  variant = 'h1',
  ...props
}: HeadingElementProps) {
  return (
    <PlateElement
      as={variant!}
      className={cn(
        headingVariants({ variant }),
        highlighted && 'heading-highlight-fade'
      )}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}
