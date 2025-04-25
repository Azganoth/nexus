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
