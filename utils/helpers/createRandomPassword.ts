export const createRandomPassword = () => {
    return Math.random().toString(36).slice(-8);
};
