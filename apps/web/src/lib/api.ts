import { NotFoundError, PrivateProfileError } from "@repo/shared/errors";

// Auth
export const signup = async (
  email: string,
  password: string,
): Promise<void> => {
  console.log("signup:", { email, password });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2500);
  });
};

export const login = async (email: string, password: string): Promise<void> => {
  console.log("login:", { email, password });
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2500);
  });
};

// Profile
export interface Profile {
  name: string;
  avatarUrl: string;
  bio?: string;
  links: { title: string; url: string }[];
  seoTitle?: string;
  seoDescription?: string;
}

export const getProfile = async (username: string): Promise<Profile> => {
  console.log("profile:", { username });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (username) {
        case "isa":
          resolve({
            name: "Isa Silveira",
            avatarUrl: "",
            bio: "Designer multidisciplinar com paixão por ilustração digital e branding. Transformando ideias em identidades visuais. Trabalho freelance aberto!",
            links: [
              {
                title: "Portfólio Behance",
                url: "https://behance.net/isa.silveira",
              },
              { title: "Instagram", url: "https://instagram.com/isa.design" },
              { title: "Website", url: "http://isasilveira.com.br" },
            ],
          });
          break;
        case "private":
          reject(new PrivateProfileError());
          break;
        default:
          reject(new NotFoundError("Profile"));
          break;
      }
    }, 2500);
  });
};
