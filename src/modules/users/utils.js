function sanitizeUser(user) {
  return {
    user_id: user.user_id,
    email: user.email,
    login_method: user.login_method,
    alias_id: user.alias_id,
    alias_index: user.alias_index,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    school_id: user.school_id,
    school_name: user.school_name,
    school_short_name: user.school_short_name,
    school_logo_url: user.school_logo_url,
    status: user.status,
    banned_reason: user.banned_reason,
    deleted_reason: user.deleted_reason,
  };
}

module.exports = { sanitizeUser };