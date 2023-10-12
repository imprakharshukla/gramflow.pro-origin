"use client";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui";
import { Dispatch, SetStateAction } from "react";
import { NullableVoidFunction } from "../data-table";

export default function DashboardConfirmModal({
  showConfimation,
  setShowConfirmation,
  confirmMessage,
  onConfirmFunction,
}: {
  showConfimation: boolean;
  setShowConfirmation: Dispatch<SetStateAction<boolean>>;
  confirmMessage: string;
  onConfirmFunction: NullableVoidFunction;
}) {
  return (
    <AlertDialog open={showConfimation} onOpenChange={setShowConfirmation}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (onConfirmFunction) onConfirmFunction();
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
