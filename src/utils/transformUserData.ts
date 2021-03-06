interface IResponse {
  [key: string]: string | number | null;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function transformUserData(user: IResponse) {
  return {
    accessToken: user.access_token,
    bio: user.bio,
    createdAt: user.created_at,
    email: user.email,
    id: user.id,
    image: user.image,
    refreshToken: user.refresh_token,
    updatedAt: user.updated_at,
    username: user.username,
  };
}

export default transformUserData;
