import { supabase } from '../../../supabase/supabase';

interface CourseCategoryCredit {
  credits_earned: string | number
}

export interface Course {
  id: string
  provider: string | null
  completion_date: string
  course_category_credits: CourseCategoryCredit[]
}

export interface CourseInput {
  title: string;
  provider?: string;
  completion_date: string;
  credits?: string | number;
  category_id?: string;
  [key: string]: unknown;
}

/**
 * Fetch all CPE courses.
 */
export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('cpe_courses')
    .select(
      '*, course_category_credits(category_id, credits_earned, is_primary, course_categories(name))'
    )
    .order('completion_date', { ascending: false });

  if (error) throw error;

  return data as Course[];
}

/**
 * Fetch a single course.
 */
export async function getCourseById(id: string): Promise<Course> {
  const { data, error } = await supabase
    .from('cpe_courses')
    .select(
      '*, course_category_credits(category_id, credits_earned, is_primary, course_categories(name))'
    )
    .eq('id', id)
    .single();

  if (error) throw error;

  return data as Course;
}

/**
 * Add a course.
 */
export async function addCourse(
  course: CourseInput
): Promise<Course> {
  const { credits, category_id, ...coursePayload } = course;

  const { data: savedCourse, error: courseError } = await supabase
    .from('cpe_courses')
    .insert([coursePayload])
    .select()
    .single();

  if (courseError) throw courseError;

  if (category_id && credits !== undefined) {
    const { error: creditsError } = await supabase
      .from('course_category_credits')
      .insert([
        {
          course_id: savedCourse.id,
          category_id,
          credits_earned: Number(credits),
          is_primary: true,
        },
      ]);

    if (creditsError) throw creditsError;
  }

  return savedCourse as Course;
}

/**
 * Update a course.
 */
export async function updateCourse(
  id: string,
  updates: Partial<CourseInput>
): Promise<Course> {
  const { credits, category_id, ...coursePayload } = updates;

  const { data: savedCourse, error: courseError } = await supabase
    .from('cpe_courses')
    .update(coursePayload)
    .eq('id', id)
    .select()
    .single();

  if (courseError) throw courseError;

  if (category_id && credits !== undefined) {
    await supabase
      .from('course_category_credits')
      .delete()
      .eq('course_id', id);

    const { error: creditsError } = await supabase
      .from('course_category_credits')
      .insert([
        {
          course_id: id,
          category_id,
          credits_earned: Number(credits),
          is_primary: true,
        },
      ]);

    if (creditsError) throw creditsError;
  }

  return savedCourse as Course;
}

/**
 * Delete a course.
 */
export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from('cpe_courses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
