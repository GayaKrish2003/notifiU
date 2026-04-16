export const getFAQCategories = (req, res) => {
    res.status(200).json("Here are the FAQ categories");
}

export const createFAQCategory = (req, res) => {
    res.status(201).json("FAQ category created");
}

export const updateFAQCategory = (req, res) => {
    const id = req.params.id;
    res.status(200).json(`FAQ category with id ${id} updated`);
}

export const deleteFAQCategory = (req, res) => {
    const id = req.params.id;
    res.status(200).json(`FAQ category with id ${id} deleted`);
}

export const getFAQs = (req, res) => {
    res.status(200).json("Here are the FAQs");
}

export const getFAQsGroupedByCategory = (req, res) => {
    res.status(200).json("Here are the FAQs grouped by category");
}

export const getFAQById = (req, res) => {
    const id = req.params.id;
    res.status(200).json(`Here is the FAQ with id ${id}`);
}

export const createFAQ = (req, res) => {
    res.status(201).json("FAQ created");
}

export const updateFAQ = (req, res) => {
    const id = req.params.id;
    res.status(200).json(`FAQ with id ${id} updated`);
}

export const deleteFAQ = (req, res) => {
    const id = req.params.id;
    res.status(200).json(`FAQ with id ${id} deleted`);
}
