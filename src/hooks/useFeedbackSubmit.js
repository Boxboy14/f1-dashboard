import { useMutation } from "@tanstack/react-query";
import { sendFeedback } from "../services/feedback/emailjs.js";

export function useFeedbackSubmit() {
  return useMutation({ mutationFn: sendFeedback });
}
