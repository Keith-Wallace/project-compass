import { supabase } from '../../supabase/supabase'

export interface CourseCategory {
  id: string
  name: string
}

/**
 * Fetch all available course categories.
 */
export async function getCategories(): Promise<CourseCategory[]> {
  const { data, error } = await supabase
    .from('course_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as CourseCategory[]
}

/**
 * Assign a category to a course.
 * @param {string} courseId - Course UUID
 * @param {string} categoryId - Category UUID
 */
export async function addCategoryToCourse(courseId: string, categoryId: string) {
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
export async function removeCategoryFromCourse(courseId: string, categoryId: string) {
  const { error } = await supabase
    .from('course_category_credits')
    .delete()
    .eq('course_id', courseId)
    .eq('category_id', categoryId)

  if (error) throw error
}
