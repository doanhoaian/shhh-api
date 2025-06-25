function sanitizePost(post) {
  return {
    id: post.id,
    user_id: post.user_id,
    school_id: post.school_id,

    post_type: 'confession',
    avatar_url: post.avatar_url,
    display_name: post.display_name,

    school_short_name: post.school_short_name,

    content: post.content,
    images: Array.isArray(post.images) ? post.images : [],

    status: post.status,
    comment_permission: post.comment_permission,
    view_permission: post.view_permission,

    total_like: Number(post.total_like || 0),
    total_dislike: Number(post.total_dislike || 0),
    total_comment: Number(post.total_comment || 0),

    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}

module.exports = { sanitizePost };
