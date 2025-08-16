export const getIdFromParams = (req) => req.params.id;

export const getUserIdFromRequest = (req) => req.user?._id;

export const getUserRoleFromRequest = (req) => req.user?.userRole;

export const extractCommonQueryParams = (req) => {
  const { limit = 10, page = 1, search = '' } = req.query;
  return {
    limit: parseInt(limit, 10) || 10,
    skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) || 0,
    search: search.trim(),
  };
};

export function extractQueryParams(req) {
  const {
    limit,
    page = 1,
    search,
    sortBy = 'createdAt',
    order = 'desc',
    ...filters
  } = req.query;
  const parsedLimit = limit ? parseInt(limit, 10) : undefined;
  const skip = parsedLimit ? (page - 1) * parsedLimit : 0;
  return {
    limit: parsedLimit,
    skip,
    search,
    sortBy,
    order,
    filters,
  };
};

export const getSourceFromRequest = (req) => req.body?.source;