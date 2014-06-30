Resque::Server.helpers do
  ####################
  #failed.erb helpers#
  ####################

  def failed_date_format
    "%Y/%m/%d %T %z"
  end

  def failed_multiple_queues?
    return @multiple_failed_queues if defined?(@multiple_failed_queues)
    @multiple_failed_queues = Resque::Failure.queues.size > 1
  end

  def failed_size
    @failed_size ||= Resque::Failure.count(params[:queue], params[:class])
  end

  def failed_per_page
    @failed_per_page = if params[:class]
      failed_size  
    else
      20
    end
  end

  def failed_start_at
    params[:start].to_i
  end

  def failed_end_at
    if failed_start_at + failed_per_page > failed_size
      failed_size
    else
      failed_start_at  + failed_per_page
    end
  end

  def failed_order
    params[:order] || 'desc'
  end

  def failed_class_counts(queue = params[:queue])
    classes = Hash.new(0)
    Resque::Failure.each(0, Resque::Failure.count(queue), queue) do |_, item|
      class_name = item['payload']['class'] if item['payload']
      class_name ||= "nil"
      classes[class_name] += 1
    end
    classes
  end

  ####################
  #queues.erb helpers#
  ####################
  def format_latency(time_seconds)
    return '0' if time_seconds == 0

    time = Time.at(time_seconds)

    time_format, time_unit = '', ''
    if time.hour > 0
      time_format, time_unit = '%H:', 'h'
    end
    if time_format.present?
      time_format += '%M:'
    elsif time.min > 0
      time_format, time_unit = '%M:', 'm'
    end
    if time_format.present?
      time_format += '%S'
    elsif time.sec > 0
      time_format, time_unit = '%1S.%1N', 's'
    end
    return '< 1s' unless time_format.present?
    time.strftime("#{time_format}#{time_unit}")
  end
end
