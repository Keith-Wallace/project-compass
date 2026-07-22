import { supabase } from '../../supabase/supabase'

/**
 * Fetch all available course categories.
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('course_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Assign a category to a course.
 * @param {string} courseId - Course UUID
 * @param {string} categoryId - Category UUID
 */
export async function addCategoryToCourse(courseId, categoryId) {
  const { data, error } = await supabase
    .from('course_category_credits')
    .insert([{ course_id: courseId, category_id: categoryId }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove a category from a course.
 * @param {string} courseId - Course UUID
 * @param {string} categoryId - Category UUID
 */
export async function removeCategoryFromCourse(courseId, categoryId) {
  const { error } = await supabase
    .from('course_category_credits')
    .delete()
    .eq('course_id', courseId)
    .eq('category_id', categoryId)

  if (error) throw error
}
