import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Username = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export interface Response {
  username: string;
  available: boolean;
  checkTimeMs: number;
  source: string;
  suggestions: string[];
}

export interface CreateUsernameResponse {
  success: boolean;
  message: string;
}
