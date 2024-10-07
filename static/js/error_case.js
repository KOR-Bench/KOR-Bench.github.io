$(document).ready(function() {
    let currentIndex = 0; 
    let currentCategory = 'operation'; 
    let data = []; 


    loadTableData(currentCategory);

    $('.tabs ul li').on('click', function() {
        $('.tabs ul li').removeClass('is-active');
        $(this).addClass('is-active');
        const target = $(this).data('target');
        currentCategory = target;
        loadTableData(currentCategory);
    });


    function loadTableData(category) {
        $.getJSON(`./static/data/error_case_${category}.json`)
            .done(function(response) {
                data = response; 
                if (data.length > 0) {
                    currentIndex = 0; 
                    showItem(currentIndex); 
                } else {
                    $('#content-area').html('<p>该类别没有可用数据。</p>');
                }
            })
            .fail(function(jqxhr, textStatus, error) {
                let err = textStatus + ", " + error;
                $('#content-area').html(`加载数据时出错: ${err}`);
            });
    }

    function showItem(index) {
        const entry = data[index];
        if (entry) {
            $('#rule-content').html(entry.rule_content.replace(/\n/g, '<br>'));
            $('#question-content').html(entry.question.replace(/\n/g, '<br>'));
            $('#answer-content').html(entry.answer.replace(/\n/g, '<br>'));
            $('#model-response').html(entry.response.replace(/\n/g, '<br>'));
        }
    }

    $('.prev').on('click', function() {
        if (data.length > 0) {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : data.length - 1; 
            showItem(currentIndex);
        }
    });

    $('.next').on('click', function() {
        if (data.length > 0) {
            currentIndex = (currentIndex < data.length - 1) ? currentIndex + 1 : 0; 
            showItem(currentIndex);
        }
    });
});
