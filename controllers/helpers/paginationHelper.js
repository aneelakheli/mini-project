exports.getPaginatedDataWithRegex = async (
  model,
  findQuery,
  {
    query,
    random,
    page = 1,
    limit = 20,
    sort = { _id: "desc" },
    select = "-__v",
    lean = true,
    populate = [],
    searchAts = [],
  }
) => {
  if (random) {
    const getTotalCount = async () => {
      return await model.count(findQuery);
    };
    const getNextPage = () => {
      if (docs.length > parseInt(limit)) {
        docs.pop();
        return parseInt(page) + 1;
      }
    };
    const [docs, totalCount] = await Promise.all([
      model
        .findRandom(findQuery)
        .select(select)
        .sort(sort)
        .skip(Math.max(parseInt(page) - 1, 0) * parseInt(limit))
        .limit(parseInt(limit) + 1)
        .populate(populate)
        .lean(lean),
      getTotalCount(),
    ]);
    console.log(await getTotalCount());
    return {
      docs,
      nextPage: getNextPage() || null,
      totalCount,
      totalPages:
        Math.ceil(parseInt(totalCount) / parseInt(limit)) || undefined,
    };
  }
  if (query) {
    const getTotalCountForSearchQuery = async () => {
      return await model.count(findQuery);
    };
    const getNextPage = () => {
      if (docs.length > parseInt(limit)) {
        docs.pop();
        return parseInt(page) + 1;
      }
    };
    const generateSearchQuery = () => {
      const searchQuery = {
        $or: searchAts
          .map((searchAt) => {
            const wordQuery = query.split(" ").map((word) => {
              const searchQuery = generateSearchQuery();
              if (!word.length) {
                return null;
              }
              const sQuery = {};
              sQuery[searchAt] = {
                $regex: word,
                $options: "i",
              };
              return sQuery;
            });
            return wordQuery;
          })
          .flat(),
      };
      const returnData = {
        $and: [findQuery, searchQuery],
      };
      return returnData;
    };
    const [docs, totalCount] = await Promise.all([
      model
        .find(findQuery)
        .select(select)
        .sort(sort)
        .skip(Math.max(parseInt(page) - 1, 0) * parseInt(limit))
        .limit(parseInt(limit) + 1)
        .populate(populate)
        .lean(lean),
      getTotalCountForSearchQuery(),
    ]);
    return {
      query,
      docs,
      nextPage: getNextPage() || null,
      totalCount,
      totalPages:
        Math.ceil(parseInt(totalCount) / parseInt(limit)) || undefined,
    };
  } else {
    return await model.paginate(findQuery, {
      page: Math.max(parseInt(page), 1),
      limit,
      sort,
      lean,
      select,
      populate,
    });
  }
};
